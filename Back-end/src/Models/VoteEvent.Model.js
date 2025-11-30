import mongoose from "mongoose";

const EventSchema=new mongoose.Schema({
     Title:{
        type:String,
        trim:true,
        required:true
     },
     Description:{
        type:String,
     },
     BallotImage:
      [{
        url: { type: String, required: true },
        publicId: { type: String, required: true }
     }],
     UsedBallotImage:[{
        url: { type: String, required: true },
        publicId: { type: String, required: true }
     }],
     RegEndTime:{
         type: Date,
         required:true
     },
     VoteStartTime:{
        type: Date,
        required:true
     },
     VoteEndTime:{
        type: Date,
        required:true
     },

     ElectionType:{
        type:String,
        enum:["Single","Rank","MultiVote"],
        required:true
     },
     CreateBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
     },
     votingMode:{
       type:String,
       enum:["online","onCampus"],
       required:true
     },
     // Optional fields to support onCampus rotating code
     codeRotationMinutes: { type: Number, default: 2 },
     currentVoteCode: { type: String, default: null },
     currentCodeExpiresAt: { type: Date, default: null },
     // Optional place name for on-campus events
     place: { type: String, default: null }

},{timestamps:true});


export const VoteEvent= mongoose.model("VoteEvent",EventSchema);