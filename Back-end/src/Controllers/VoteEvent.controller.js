import { upload } from "../Middleware/Multer.Middleware.js";
import { NomineeReg } from "../Models/Nominee.Model.js";
import { VoteCount } from "../Models/VoteCount.Model.js";
import { VoteEvent } from "../Models/VoteEvent.Model.js";
import { VoterReg } from "../Models/Voter.Model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { AsynHandler } from "../Utils/AsyncHandler.js";
import { FileDelete, FileUpload } from "../Utils/Cloudinary.js";
import mongoose from "mongoose";
import { getIO } from "../socket.js";
import { User } from "../Models/User.Model.js";
import { transporter } from "../Middleware/Email.config.js";


const CreateVoteEvent = AsynHandler(async(req,res)=>{

    const CreateBy = req.user?._id; 
    if (!CreateBy || req.user.Role!=="admin") {throw new ApiError(401, "Unauthorized: Admin not found");}

    const {Title="",Description="",RegEndTime,VoteStartTime,
    VoteEndTime,ElectionType, votingMode, codeRotationMinutes}=req.body;

   if (!Title || !RegEndTime || !VoteStartTime || !VoteEndTime || !ElectionType || !votingMode) {
    throw new ApiError(402, "All fields are required");
   }

    // parse dates
    const regEnd = new Date(RegEndTime)
    const voteStart = new Date(VoteStartTime)
    const voteEnd = new Date(VoteEndTime)

    if (isNaN(regEnd.getTime()) || isNaN(voteStart.getTime()) || isNaN(voteEnd.getTime())) {
      throw new ApiError(402, "Invalid date format for event times")
    }
    
    let BallotImagePath=[];
    let array=req.files?.BallotImage;
    if(!array)throw new ApiError(401,"BallotImages Are needed! ");


    for (let index = 0; index < array.length; index++) {
        const element = array[index]?.path;
        const LocalPath=await FileUpload(element);
        
        if(!LocalPath){throw new ApiError(401,"BallotImage required");}
          else{
           BallotImagePath.push({
            url: LocalPath?.url,
            publicId: LocalPath?.public_id
           
         });

        }
    }

    const createEvent= await VoteEvent.create({
        Title,
        Description,
        BallotImage:BallotImagePath,
        RegEndTime: regEnd,
        VoteStartTime: voteStart,
        VoteEndTime: voteEnd,
        ElectionType,
        CreateBy,
        votingMode,
        codeRotationMinutes: votingMode==='onCampus' ? (parseInt(codeRotationMinutes,10)||2) : undefined
    })
   
    console.log("Event Create succesfully!");
    try{ getIO().emit('eventCreated', { eventId: createEvent._id, title: createEvent.Title }); }catch(e){}
   return res
          .status(201)
          .json(
            new ApiResponse(201,createEvent,"Event create Succesfully! ")
          )

})


const NomineeRegister=AsynHandler(async(req,res)=>{
     if (!req.body) {
     throw new ApiError(400, "Request body is missing");
       }


     const {Description,SelectedBalot,EventID}=req.body;
     if(!SelectedBalot){
        throw new ApiError(401,"Ballot select are required");
     }



     if(!EventID){
        throw new ApiError(401,"Event id are required");
     }


     const UserID=req.user?._id;
     if(!UserID){
        throw new ApiError(401,"User not found");
     }



      const Event = await VoteEvent.findById(EventID);
       if (!Event) {
      throw new ApiError(401, "Vote event not found");
       }
     


     const checkReg=  await NomineeReg.findOne({EventID,UserID});
      if(checkReg){
         throw new ApiError(401,"You are already registered");
      } 

      if (new Date() > new Date(Event.RegEndTime)) {
          throw new ApiError(403, "Nominee Registration period has ended");
       }

     // ensure ballot is still available
     const existsInAvailable = Event.BallotImage.some(img => img.publicId === SelectedBalot?.publicId)
     const existsInUsed = Event.UsedBallotImage.some(img => img.publicId === SelectedBalot?.publicId)
     if(!existsInAvailable || existsInUsed){
        throw new ApiError(409, "Selected ballot already used")
     }

     const NomineeID=await NomineeReg.create({
         UserID,
         EventID,
         SelectedBalot,
         Description
     })
      
     if(!NomineeID){
        throw new ApiError(401,"Nominee register not completed");
     }

     // reserve ballot immediately
     Event.UsedBallotImage.push({ url: SelectedBalot.url, publicId: SelectedBalot.publicId })
     Event.BallotImage = Event.BallotImage.filter(img => img.publicId !== SelectedBalot.publicId)
     await Event.save({ validateBeforeSave: false })

     console.log("Nominee register succesfully");
     return res
     .status(201)
     .json(
        new ApiResponse(201,NomineeID,"Nominee register succesfully! awaiting admin approval")
     )

})


const VoterRegister=AsynHandler(async(req,res)=>{
     if (!req.body) {
     throw new ApiError(400, "Request body is missing");
       }


     const {EventID}=req.body;
    
     if(!EventID){
        throw new ApiError(401,"Event id are required");
     }


     const UserID=req.user?._id;
     if(!UserID){
        throw new ApiError(401,"User not found");
     }



      const Event = await VoteEvent.findById(EventID);
      if (!Event) {
           throw new ApiError(401, "Vote event not found");
       }


    const existingVoter = await VoterReg.findOne({ EventID, UserID });
        if (existingVoter) {
           throw new ApiError(409, "You are already registered to vote for this event");
        }


       if (new Date() > new Date(Event.RegEndTime)) {
       throw new ApiError(403, "Registration period has ended");
       }

      const votingReg= await VoterReg.create({
           EventID,
           UserID,
           
       })
    if(!votingReg){
        throw new ApiError(501,"failed to register for vote");
    }
    console.log("successfully register for vote!");
    return res
    .status(201)
    .json(
        new ApiResponse(201,votingReg,"successfully register for vote!")
    )
})



const GivenVote=AsynHandler(async(req,res)=>{
    const {EventID,ElectionType,SelectedNominee, code} = req.body;
    const UserID=req.user?._id;
    if(!EventID || !UserID || !ElectionType || !SelectedNominee){ throw new ApiError(401,"EventId and user invalid! "); }
    if(!Array.isArray(SelectedNominee) || SelectedNominee.length === 0){ throw new ApiError(400, "Please select at least one nominee before submitting your vote"); }
    if(ElectionType === 'Single' && SelectedNominee.length !== 1){ throw new ApiError(400, "Please select exactly one nominee for Single vote"); }

    const DetailsVoteReg=await VoterReg.findOne({EventID,UserID});
    if(!DetailsVoteReg){ throw new ApiError(401,"You are not Registered!"); }

    const Event = await VoteEvent.findById(EventID);
    if (!Event) { throw new ApiError(401, "Vote event not found"); }

    // Code verification before any tally operations
    if(Event.votingMode === 'online'){
        if(!code || !/^[0-9]{6}$/.test(String(code))){ throw new ApiError(400,'Valid 6-digit code required'); }
        if(!DetailsVoteReg.emailCode){ throw new ApiError(403,'Request code first'); }
        if(new Date() > new Date(DetailsVoteReg.emailCodeExpiresAt)){ throw new ApiError(403,'Code expired'); }
        if(String(DetailsVoteReg.emailCode) !== String(code)){ throw new ApiError(403,'Invalid code'); }
    } else if(Event.votingMode === 'onCampus') {
        if(!code || !/^[0-9]{6}$/.test(String(code))){ throw new ApiError(400,'Current on-campus code required'); }
        if(!Event.currentVoteCode || !Event.currentCodeExpiresAt){ throw new ApiError(403,'Voting code not active'); }
        if(new Date() > new Date(Event.currentCodeExpiresAt)){ throw new ApiError(403,'Code expired'); }
        if(String(Event.currentVoteCode) !== String(code)){ throw new ApiError(403,'Invalid code'); }
    }

    if(DetailsVoteReg.hasVoted){ throw new ApiError(401,"you are already given vote! "); }

    // Validate nominees after code check
    const approvedNominees = await NomineeReg.find({ EventID, Approved: true }).select('UserID').lean();
    const approvedIds = approvedNominees.map(n => String(n.UserID));
    for (const nominee of SelectedNominee) {
        if (!approvedIds.includes(String(nominee.NomineeId))) {
            throw new ApiError(404, `Nominee ${nominee.NomineeId} is not valid for this event`);
        }
    }

    const now = new Date();
    const start = new Date(Event.VoteStartTime);
    const end = new Date(Event.VoteEndTime);
    if (now < start || now > end) { throw new ApiError(403, "Voting is not currently open"); }

    // Tally-only update
    const eventObjId = new mongoose.Types.ObjectId(EventID);
    let tallyDoc = await VoteCount.findOne({ EventID: eventObjId, ElectionType });
    if (!tallyDoc) {
      tallyDoc = await VoteCount.create({ EventID: eventObjId, ElectionType, Tally: [] });
    }

    const toObjectId = (v)=> (typeof v === 'string' ? new mongoose.Types.ObjectId(v) : v);

    // Work on a mutable copy to guarantee mongoose change tracking
    const tallyArr = Array.isArray(tallyDoc.Tally) ? [...tallyDoc.Tally] : [];

    const ensureEntry = (id) => {
      const sid = String(id);
      let entry = tallyArr.find(t => String(t.NomineeId) === sid);
      if (!entry) {
        entry = { NomineeId: toObjectId(sid), TotalVote: 0, TotalRank: 0 };
        tallyArr.push(entry);
      }
      return entry;
    };

    if (ElectionType === 'Single') {
      const id = SelectedNominee[0].NomineeId;
      ensureEntry(id).TotalVote += 1;
    } else if (ElectionType === 'MultiVote') {
      const unique = Array.from(new Set(SelectedNominee.map(x => String(x.NomineeId))));
      unique.forEach(sid => { ensureEntry(sid).TotalVote += 1; });
    } else if (ElectionType === 'Rank') {
      const N = approvedIds.length || SelectedNominee.length; // fallback
      const rankMap = new Map(); // id -> rank
      SelectedNominee.forEach(x => {
        const r = typeof x.Rank === 'number' ? x.Rank : parseInt(x.Rank,10) || N;
        rankMap.set(String(x.NomineeId), Math.max(1, Math.min(N, r)));
      });
      approvedIds.forEach(sid => {
        const score = rankMap.get(sid) || N;
        ensureEntry(sid).TotalRank += score;
      });
    } else {
      throw new ApiError(400, 'Unknown ElectionType');
    }

    tallyDoc.Tally = tallyArr;
    tallyDoc.markModified('Tally');
    await tallyDoc.save({ validateBeforeSave: false });

    DetailsVoteReg.hasVoted=true;
    await DetailsVoteReg.save({validateBeforeSave:false});

    try{ getIO().to(String(EventID)).emit('voteUpdate', { eventId: EventID }); }catch(e){}
    
    return res
    .status(201)
    .json(
        new ApiResponse(201,{ tallied:true },"You succesfully voted!")
    )

})


const CountingVote=AsynHandler(async(req,res)=>{
    console.log("countvote");
   

     const EventID = req.body?.EventID || req.query?.EventID;
     if(!EventID){
        throw new ApiError(401,"EventID is required! ");
     }
    
    const eventObjId = new mongoose.Types.ObjectId(EventID);
    const [docSingle, docMulti, docRank] = await Promise.all([
      VoteCount.findOne({ EventID: eventObjId, ElectionType: 'Single' }).lean(),
      VoteCount.findOne({ EventID: eventObjId, ElectionType: 'MultiVote' }).lean(),
      VoteCount.findOne({ EventID: eventObjId, ElectionType: 'Rank' }).lean(),
    ]);

    // Combine Single + Multi tallies
    const voteMap = new Map(); // id -> TotalVote
    const addVotes = (doc) => {
      if (!doc || !Array.isArray(doc.Tally)) return;
      doc.Tally.forEach(t => {
        const sid = String(t.NomineeId);
        voteMap.set(sid, (voteMap.get(sid) || 0) + (t.TotalVote || 0));
      });
    };
    addVotes(docSingle); addVotes(docMulti);

    const rankListRaw = Array.isArray(docRank?.Tally) ? docRank.Tally : [];

    // Collect all nominee IDs we will report on
    const allIdsSet = new Set([ ...voteMap.keys(), ...rankListRaw.map(t=>String(t.NomineeId)) ]);
    const allIds = Array.from(allIdsSet).map(id => new mongoose.Types.ObjectId(id));

    // Lookup names
    let nameMap = new Map();
    if (allIds.length) {
      const users = await User.find({ _id: { $in: allIds } }).select('FullName').lean();
      users.forEach(u => nameMap.set(String(u._id), u.FullName || 'Unknown'));
    }

    const NomineeListForSingleAndMultiVote = Array.from(voteMap.entries()).map(([id, TotalVote]) => ({
      NomineeID: id,
      NomineeIDName: nameMap.get(id) || 'Unknown',
      TotalVote
    })).sort((a,b)=> b.TotalVote - a.TotalVote);

    const NomineeListForRank = rankListRaw.map(t => ({
      NomineeID: String(t.NomineeId),
      NomineeIDName: nameMap.get(String(t.NomineeId)) || 'Unknown',
      TotalRank: t.TotalRank || 0,
    })).sort((a,b)=> a.TotalRank - b.TotalRank);
 
    try{ getIO().to(String(EventID)).emit('countUpdate', { eventId: EventID, rank: NomineeListForRank, simple: NomineeListForSingleAndMultiVote }); }catch(e){}
     return res
     .status(201)
     .json(
        new ApiResponse(201,{NomineeListForRank,NomineeListForSingleAndMultiVote},"Votecount successfully! ")
     )
})


const NomineeApproved = AsynHandler(async (req, res) => {
  const { EventID, NomineeID } = req.body;

  if (req.user?.Role !== "admin") {
    throw new ApiError(401, "You are not authorized as admin");
  }

  const Event = await VoteEvent.findById(EventID);
  if (!Event) {
    throw new ApiError(404, "Vote event not found");
  }

  const NomineeRegForm = await NomineeReg.findOne({ EventID, UserID: NomineeID });
  if (!NomineeRegForm) {
    throw new ApiError(404, "Nominee not found for this event");
  }

  if (NomineeRegForm.Approved) {
    throw new ApiError(402, "Already approved ! ");
  }

  NomineeRegForm.Approved = true;
  await NomineeRegForm.save({ validateBeforeSave: false });

  const nomineeImage = {
    url: NomineeRegForm.SelectedBalot?.url,
    publicId: NomineeRegForm.SelectedBalot?.publicId,
  };

  if (!nomineeImage.url || !nomineeImage.publicId) {
    throw new ApiError(400, "Nominee image data is missing");
  }

  const alreadyUsed = Event.UsedBallotImage.some(img => img.publicId === nomineeImage.publicId)
  if(!alreadyUsed){
    Event.UsedBallotImage.push(nomineeImage);
  }
  Event.BallotImage = Event.BallotImage.filter(
    (img) => img.publicId !== NomineeRegForm.SelectedBalot?.publicId
  );

  await Event.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, NomineeRegForm, "Nominee approved successfully!"));
});

const GetAllBallotImage=AsynHandler(async(req,res)=>{
     const EventID = req.body?.EventID || req.query?.EventID;

     if(!EventID){
        throw new ApiError(401,"EventID required! ")
     }

     const Event = await VoteEvent.findById(EventID);
     if (!Event) {
        throw new ApiError(404, "Vote event not found");
     }
    
      const allUrls = [
        ...Event.BallotImage.map(img => img.url),
        ...Event.UsedBallotImage.map(img => img.url)
     ];

  return res.status(200).json(
    new ApiResponse(200, allUrls, "All ballot image URLs retrieved successfully")
  );
     
})

const GetAvailableBallotImage=AsynHandler(async(req,res)=>{
      const {EventID} = req.body?.EventID ? req : { body: {}, query: req.query };
      const eventIdVal = req.body?.EventID || req.query?.EventID;

     if(!eventIdVal){
        throw new ApiError(401,"EventID required! ")
     }

     const Event = await VoteEvent.findById(eventIdVal);
     if (!Event) {
        throw new ApiError(404, "Vote event not found");
     }
    
      const images = Event.BallotImage.map(img => ({ url: img.url, publicId: img.publicId }));

  return res.status(200).json(
    new ApiResponse(200, images, "Available ballot images retrieved successfully")
  );
})

const GetUsedBallotImage=AsynHandler(async(req,res)=>{
      const EventID = req.body?.EventID || req.query?.EventID;

     if(!EventID){
        throw new ApiError(401,"EventID required! ")
     }

     const Event = await VoteEvent.findById(EventID);
     if (!Event) {
        throw new ApiError(404, "Vote event not found");
     }
    
      const allUrls = [
        ...Event.UsedBallotImage.map(img => img.url)
       ];

      return res.status(200).json(
    new ApiResponse(200, allUrls, "All Used ballot image URLs retrieved successfully")
  );
})


const GetApprovedNominee = AsynHandler(async (req, res) => {
  const EventID = req.body?.EventID || req.query?.EventID;

  if (!EventID) {
    throw new ApiError(401, "EventID is required!");
  }

  const NomineeDetails = await NomineeReg.find({ EventID, Approved: true })
    .select("UserID SelectedBalot")
    .populate('UserID', 'FullName UserName ProfileImage');

  // if (!NomineeDetails || NomineeDetails.length === 0) {
  //   throw new ApiError(401, "No approved nominees found for this event");
  // }

  return res.status(200).json(
    new ApiResponse(200, {
      NomineeDetails:NomineeDetails||[],
      count: NomineeDetails?.length||0
    }, "Approved nominees retrieved successfully")
  );
});


const GetPendingNominee = AsynHandler(async (req, res) => {
  const EventID = req.body?.EventID || req.query?.EventID;

  if (!EventID) {
    throw new ApiError(401, "EventID is required!");
  }

  const NomineeDetails = await NomineeReg.find({ EventID, Approved: false })
    .select("UserID SelectedBalot")
    .populate('UserID', 'FullName UserName ProfileImage');

  // if (!NomineeDetails || NomineeDetails.length === 0) {
  //   throw new ApiError(401, "No pending nominees ");
  // }

  return res.status(200).json(
    new ApiResponse(200, {
      NomineeDetails: NomineeDetails || [],
      count: NomineeDetails?.length||0
    }, "Pending nominees retrieved successfully")
  );
});


const GetVoter=AsynHandler(async(req,res)=>{
     const EventID = req.body?.EventID || req.query?.EventID;

  if (!EventID) {
    throw new ApiError(401, "EventID is required!");
  }

  const VoterDetails = await VoterReg.find({ EventID}).select("UserID").populate('UserID', 'FullName UserName ProfileImage');

  // if (!VoterDetails || VoterDetails.length === 0) {
  //   throw new ApiError(401, "No voter found");
  // }

  return res.status(200).json(
    new ApiResponse(200, {
      VoterDetails:VoterDetails||[],
      count: VoterDetails?.length||0
    }, "Voter details retrived successfully")
  );

})

const getVoterPerticipate=AsynHandler(async(req,res)=>{
       const EventID = req.body?.EventID || req.query?.EventID;

  if (!EventID) {
    throw new ApiError(401, "EventID is required!");
  }

  const GivenVoter = await VoterReg.find({ EventID,hasVoted:true}).select("UserID").populate('UserID', 'FullName UserName ProfileImage');

  // if (!GivenVoter || GivenVoter.length === 0) {
  //   throw new ApiError(401, "voter found");
  // }

  const nonVoter=await VoterReg.find({ EventID,hasVoted:false}).select("UserID").populate('UserID', 'FullName UserName ProfileImage');
  
   return res.status(200).json(
    new ApiResponse(200, {
      GivenVoter:GivenVoter||[],
      givenCount: GivenVoter.length||0,
      nonVoter:nonVoter||[],
      nonCount: nonVoter?.length||0,
      VoterPerticapteRate:GivenVoter?.length/(GivenVoter?.length+nonVoter?.length)*100 || 0
    }, "Successfully fetched all voter data!")
  );
})

// New: simple status for current user in an event
const GetUserVoteStatus = AsynHandler(async (req, res) => {
  const EventID = req.body?.EventID || req.query?.EventID;
  if (!EventID) throw new ApiError(401, "EventID is required!");
  const UserID = req.user?._id;
  if (!UserID) throw new ApiError(401, "User not found");

  const reg = await VoterReg.findOne({ EventID, UserID }).select('hasVoted');
  const hasVoted = !!reg?.hasVoted;
  return res.status(200).json(new ApiResponse(200, { hasVoted }, 'Vote status fetched'));
});

// New: check current user's registration states
const GetVoterRegStatus = AsynHandler(async (req, res) => {
  const EventID = req.body?.EventID || req.query?.EventID;
  if (!EventID) throw new ApiError(401, "EventID is required!");
  const UserID = req.user?._id;
  if (!UserID) throw new ApiError(401, "User not found");
  const reg = await VoterReg.findOne({ EventID, UserID }).select('hasVoted');
  return res.status(200).json(new ApiResponse(200, { registered: !!reg, hasVoted: !!reg?.hasVoted }, 'Voter reg status'));
});

const GetNomineeRegStatus = AsynHandler(async (req, res) => {
  const EventID = req.body?.EventID || req.query?.EventID;
  if (!EventID) throw new ApiError(401, "EventID is required!");
  const UserID = req.user?._id;
  if (!UserID) throw new ApiError(401, "User not found");
  const rec = await NomineeReg.findOne({ EventID, UserID }).select('Approved');
  return res.status(200).json(new ApiResponse(200, { registered: !!rec, approved: !!rec?.Approved }, 'Nominee reg status'));
});

// New endpoint: get current user's vote history (list of votes with event & nominees)
const GetMyVoteHistory = AsynHandler(async (req, res) => {
  // Tally-only system: no per-user vote history retained
  return res.status(200).json(new ApiResponse(200, [], 'Vote history not stored'));
});

// ListEvents remains below
const ListEvents = AsynHandler(async (req, res) => {
  const status = req.query?.status; // registration | voting | finished | waiting
  const now = new Date();
  const toDate = (v)=>{
    if(!v) return null;
    if(v instanceof Date) return v;
    try{ const d = new Date(v); return isNaN(d.getTime()) ? null : d }catch{ return null }
  }
  const events = await VoteEvent.find({}).sort({ createdAt: -1 });
  const enriched = events.map(ev => {
    const regEnd = toDate(ev.RegEndTime);
    const voteStart = toDate(ev.VoteStartTime);
    const voteEnd = toDate(ev.VoteEndTime);
    let s = 'waiting';
    if (regEnd && now < regEnd) s = 'registration';
    else if (voteStart && voteEnd && now >= voteStart && now <= voteEnd) s = 'voting';
    else if (voteEnd && now > voteEnd) s = 'finished';
    return { ...ev.toObject(), status: s };
  });
  const filtered = status ? enriched.filter(e => e.status === status) : enriched;
  return res.status(200).json(new ApiResponse(200, filtered, 'Events fetched'));
});

// Generate a 6-digit code
const genCode = ()=> String(Math.floor(100000 + Math.random()*900000));

// Admin: rotate onCampus vote code
const RotateOnCampusCode = AsynHandler(async (req, res) => {
  const { EventID } = req.body;
  if (!EventID) throw new ApiError(401, 'EventID required');
  if (req.user?.Role !== 'admin') throw new ApiError(403, 'Admin only');
  const ev = await VoteEvent.findById(EventID);
  if(!ev) throw new ApiError(404, 'Event not found');
  if(ev.votingMode !== 'onCampus') throw new ApiError(400, 'Not onCampus mode');
  const now = new Date();
  const start = new Date(ev.VoteStartTime);
  const end = new Date(ev.VoteEndTime);
  if (now < start || now > end) {
    // Outside voting window: do not rotate
    throw new ApiError(400, 'Voting is not active');
  }
  const code = genCode();
  const mins = ev.codeRotationMinutes || 2;
  ev.currentVoteCode = code;
  ev.currentCodeExpiresAt = new Date(Date.now() + mins*60000);
  await ev.save({ validateBeforeSave:false });
  try{ getIO().to(String(EventID)).emit('codeRotated', { eventId: EventID, expiresAt: ev.currentCodeExpiresAt }); }catch(e){}
  return res.status(200).json(new ApiResponse(200, { code, expiresAt: ev.currentCodeExpiresAt }, 'Code rotated'));
});

// User: request email code for online vote
const SendOnlineVoteCode = AsynHandler(async (req, res) => {
  const { EventID } = req.body;
  if (!EventID) throw new ApiError(401, 'EventID required');
  const ev = await VoteEvent.findById(EventID);
  if(!ev) throw new ApiError(404, 'Event not found');
  if(ev.votingMode !== 'online') throw new ApiError(400, 'Not online mode');
  const code = genCode();
  const userId = req.user?._id;
  const reg = await VoterReg.findOne({ EventID, UserID: userId });
  if(!reg) throw new ApiError(401,'Not registered');
  reg.emailCode = code;
  reg.emailCodeExpiresAt = new Date(Date.now()+10*60000);
  await reg.save({ validateBeforeSave:false });
  try{
    await transporter.sendMail({
      from: 'E-VoteHub <no-reply@evotehub>',
      to: req.user?.Email,
      subject: `Your voting code for ${ev.Title}`,
      text: `Use this 6-digit code to vote: ${code}. It expires in 10 minutes.`
    });
  }catch(e){
    console.error('Email send error', e);
    throw new ApiError(500,'Failed to send email code');
  }
  return res.status(200).json(new ApiResponse(200, { sent:true }, 'Code sent'));
});

// Get current on-campus vote code (admin)
const GetCurrentVoteCode = AsynHandler(async (req, res) => {
  const EventID = req.body?.EventID || req.query?.EventID;
  if (!EventID) throw new ApiError(401, 'EventID required');
  if (req.user?.Role !== 'admin') throw new ApiError(403, 'Admin only');
  const ev = await VoteEvent.findById(EventID);
  if (!ev) throw new ApiError(404, 'Event not found');
  if (ev.votingMode !== 'onCampus') throw new ApiError(400, 'Not onCampus mode');

  const now = new Date();
  const start = new Date(ev.VoteStartTime);
  const end = new Date(ev.VoteEndTime);
  const votingActive = now >= start && now <= end;

  if (!votingActive) {
    // Clear any leftover code when not active
    if (ev.currentVoteCode || ev.currentCodeExpiresAt) {
      ev.currentVoteCode = null;
      ev.currentCodeExpiresAt = null;
      await ev.save({ validateBeforeSave:false });
    }
    return res.status(200).json(new ApiResponse(200, { currentVoteCode: '', currentCodeExpiresAt: null }, 'Voting not active'));
  }

  // Voting is active: generate or refresh if expired
  const needsRotate = !ev.currentVoteCode || !ev.currentCodeExpiresAt || now >= new Date(ev.currentCodeExpiresAt);
  if (needsRotate) {
    const code = genCode();
    const mins = ev.codeRotationMinutes || 2;
    ev.currentVoteCode = code;
    ev.currentCodeExpiresAt = new Date(Date.now() + mins * 60000);
    await ev.save({ validateBeforeSave: false });
    try { getIO().to(String(EventID)).emit('codeRotated', { eventId: EventID, expiresAt: ev.currentCodeExpiresAt }); } catch (e) {}
  }

  return res.status(200).json(new ApiResponse(200, {
    currentVoteCode: ev.currentVoteCode || '',
    currentCodeExpiresAt: ev.currentCodeExpiresAt || null
  }, needsRotate ? 'Code rotated' : 'Current code'));
});

// Admin: update event times
const UpdateEventTimes = AsynHandler(async (req, res) => {
  const { EventID, RegEndTime, VoteStartTime, VoteEndTime } = req.body || {}
  if (!EventID) throw new ApiError(401, 'EventID required')
  if (req.user?.Role !== 'admin') throw new ApiError(403, 'Admin only')

  const ev = await VoteEvent.findById(EventID)
  if(!ev) throw new ApiError(404, 'Event not found')

  // Parse provided fields; if not provided, keep current
  const regEnd = RegEndTime ? new Date(RegEndTime) : ev.RegEndTime
  const voteStart = VoteStartTime ? new Date(VoteStartTime) : ev.VoteStartTime
  const voteEnd = VoteEndTime ? new Date(VoteEndTime) : ev.VoteEndTime

  if ([regEnd, voteStart, voteEnd].some(d => !(d instanceof Date) || isNaN(d.getTime()))) {
    throw new ApiError(400, 'Invalid date format')
  }
  // Logical ordering: RegEnd <= VoteStart < VoteEnd
  if (regEnd > voteStart) throw new ApiError(400, 'RegEndTime must be before or equal to VoteStartTime')
  if (voteStart >= voteEnd) throw new ApiError(400, 'VoteStartTime must be before VoteEndTime')

  ev.RegEndTime = regEnd
  ev.VoteStartTime = voteStart
  ev.VoteEndTime = voteEnd

  // Handle onCampus code state based on new window
  if (ev.votingMode === 'onCampus') {
    const now = new Date()
    const active = now >= voteStart && now <= voteEnd
    if (!active) {
      // clear codes when not active
      ev.currentVoteCode = null
      ev.currentCodeExpiresAt = null
    } else {
      // ensure code exists when active
      const expired = !ev.currentVoteCode || !ev.currentCodeExpiresAt || now >= new Date(ev.currentCodeExpiresAt)
      if (expired) {
        const code = genCode()
        const mins = ev.codeRotationMinutes || 2
        ev.currentVoteCode = code
        ev.currentCodeExpiresAt = new Date(Date.now() + mins*60000)
        try{ getIO().to(String(EventID)).emit('codeRotated', { eventId: EventID, expiresAt: ev.currentCodeExpiresAt }); }catch(e){}
      }
    }
  }

  await ev.save({ validateBeforeSave: false })
  return res.status(200).json(new ApiResponse(200, ev, 'Event times updated'))
})

// Extend GivenVote to verify code
export{
    CreateVoteEvent,
    NomineeRegister,
    VoterRegister,
    GivenVote,
    CountingVote,
    NomineeApproved,
    GetAllBallotImage,
    GetAvailableBallotImage,
    GetUsedBallotImage,
    GetApprovedNominee,
    GetPendingNominee,
    GetVoter,
    getVoterPerticipate,
    ListEvents,
    GetUserVoteStatus,
    GetVoterRegStatus,
    GetNomineeRegStatus,
    GetMyVoteHistory,
    RotateOnCampusCode,
    SendOnlineVoteCode,
    GetCurrentVoteCode,
    UpdateEventTimes
}