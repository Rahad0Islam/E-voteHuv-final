import { User } from "../Models/User.Model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { AsynHandler } from "../Utils/AsyncHandler.js";
import { FileDelete, FileUpload } from "../Utils/Cloudinary.js";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs'
import { transporter } from "../Middleware/Email.config.js";
import { post } from "../Models/post.model.js";
import { VoteEvent } from "../Models/VoteEvent.Model.js";
import { Comment } from "../Models/comment.model.js";
import mongoose from "mongoose";

const posting=AsynHandler(async(req,res)=>{
    console.log("posting started ");
    const {eventID,content}=req.body;

    if(!eventID){
        throw new ApiError(401,"EventID needed!");
    }
    const UserID=req.user?._id;
     if(!UserID){
        throw new ApiError(401,"User not found");
    }

    const Event = await VoteEvent.findById(eventID);
       if (!Event) {
       throw new ApiError(401, "Vote event not found");
    }

    const pictureLocalPath=[];
    const pictureFiles = Array.isArray(req.files?.picture) ? req.files.picture : [];
    for (const pic of pictureFiles) {
        try {
            const LocalPath = await FileUpload(pic.path);
            if(LocalPath){
                pictureLocalPath.push({ url: LocalPath.url, publicId: LocalPath.public_id });
            }
        } catch (e) {
            console.error('Picture upload failed:', e?.message || e);
        }
    }

    const videoLocalPath=[];
    const videoFiles = Array.isArray(req.files?.video) ? req.files.video : [];
    for (const vid of videoFiles) {
        try {
            const LocalPath = await FileUpload(vid.path);
            if(LocalPath){
                videoLocalPath.push({ url: LocalPath.url, publicId: LocalPath.public_id });
            }
        } catch (e) {
            console.error('Video upload failed:', e?.message || e);
        }
    }
      if ((!content || content.trim() === "") &&
        pictureLocalPath.length === 0 &&
        videoLocalPath.length === 0
      ) {
     throw new ApiError(400, "Post must contain at least one of: content, picture, or video");
  }

    const creatPosing = await post.create({
        owner:UserID,
        eventID,
        picture:pictureLocalPath,
        video:videoLocalPath,
        content
    })

    console.log("post create succesfully");

    return res
     .status(201)
     .json(
        new ApiResponse(201,creatPosing,"post create succesfully ")
     )
    
})

const userComment=AsynHandler(async(req,res)=>{
    const{postID,eventID,comment}=req.body;

    if(!postID || !eventID ){
        throw new ApiError(401,"eventID and PostID is needed")

    }
    if(!comment || !(comment.trim()) || comment===""){
        throw new ApiError(401,"Comment are needed");
    }

     const UserID=req.user?._id;
     if(!UserID){
        throw new ApiError(401,"User not found");
    }

    const Event = await VoteEvent.findById(eventID);
       if (!Event) {
       throw new ApiError(401, "Vote event not found");
    }

    const Post=await post.findById(postID);

    if (!Post) {
       throw new ApiError(401, "Post are not found");
    }

    const cmt=await Comment.create({
        owner:UserID,
        eventID,
        postID,
        comment
    })

    console.log("successfully commented");

    return res
    .status(201)
    .json(
        new ApiResponse(201,cmt,"succesfully commented!")
    )
})

const postList=AsynHandler(async(req,res)=>{
      // Accept eventID from body or query for GET compatibility
      const eventID = req.body?.eventID || req.query?.eventID;
       if( !eventID ){
        throw new ApiError(401,"eventID  is needed")
    }

     const UserID=req.user?._id;
     if(!UserID){
        throw new ApiError(401,"User not found");
    }

    const Event = await VoteEvent.findById(eventID);
       if (!Event) {
       throw new ApiError(401, "Vote event not found");
    }

      const rawPosts = await post.aggregate([
    { $match: { eventID: new mongoose.Types.ObjectId(eventID) } },
    { $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "ownerDetails" } },
    { $unwind: "$ownerDetails" },
    { $project: { _id:1, content:1, picture:1, video:1, likes:1, dislikes:1, createdAt:1, eventID:1,
        "ownerDetails._id":1, "ownerDetails.FullName":1, "ownerDetails.ProfileImage":1, "ownerDetails.Role":1 } },
    { $sort: { createdAt: -1 } }
  ]);

  // Attach comments with owner data (parallel for performance)
  const posts = [];
  await Promise.all(rawPosts.map(async (p)=>{
     const comments = await Comment.find({ postID: p._id }).populate('owner','FullName ProfileImage Role').lean();
     const formattedComments = comments.map(c => ({
        _id: c._id,
        comment: c.comment,
        owner: c.owner?._id,
        ownerName: c.owner?.FullName,
        ownerProfileImage: c.owner?.ProfileImage,
        ownerRole: c.owner?.Role,
        createdAt: c.createdAt
     }))
     posts.push({ ...p, comments: formattedComments });
  }));

  console.log("post loaded succesfully ");
  return res.status(201).json(new ApiResponse(201,posts,"fetching all posting "))
})

const reactEmoji=AsynHandler(async(req,res)=>{
     const{eventID,postID,likes,dislikes}=req.body;
      
       if( !eventID || !postID ){
        throw new ApiError(401,"eventID and postID are needed")
    }

     const UserID=req.user?._id;
     if(!UserID){
        throw new ApiError(401,"User not found");
    }

    const Event = await VoteEvent.findById(eventID);
       if (!Event) {
       throw new ApiError(401, "Vote event not found");
    }
   
     const finding = await post.findById(postID);
     if (!finding) {
     throw new ApiError(401, "Post not found");
  }

   if(likes===true){
    if(finding.likes.indexOf(UserID)===-1){
        finding.likes.push(UserID);
    }

    const ind=finding.dislikes.indexOf(UserID)
    if (ind !== -1)
    finding.dislikes.splice(ind,1);
   }

   else if(dislikes===true){
    if(finding.dislikes.indexOf(UserID)==-1){
        finding.dislikes.push(UserID);
    }
     const ind=finding.likes.indexOf(UserID)
     if (ind !== -1)
    finding.likes.splice(ind,1);
   }
    

   await finding.save({validateBeforeSave:false});
   console.log("succesfully liked or dislied");

   return res
   .status(201)
   .json(
    new ApiResponse(201,"succesfully like and dislike this post")
   )
})

const countLikeDislike=AsynHandler(async(req,res)=>{
    console.log("counting like and dislike");
    const {postID}=req.body;
     if( !postID ){
        throw new ApiError(401," postID is needed")
    }
    const Post=await post.findById(postID);
    if(!Post){
        throw new ApiError(401,"post id is not valid! ");
    }

    console.log("succesfully counted ");
    return res
    .status(201)
    .json(
        new ApiResponse(201,{
            "like":Post.likes?.length ||0,
            "dislike":Post.dislikes?.length||0
        },"successfully counted user reaction ")
    )

})

// Delete a post by owner or admin, cleanup Cloudinary files
const deletePost = AsynHandler(async (req, res) => {
  const { postID, eventID } = req.body;
  if (!postID || !eventID) {
    throw new ApiError(401, "postID and eventID are needed");
  }

  const UserID = req.user?._id;
  const Role = req.user?.Role;
  if (!UserID) {
    throw new ApiError(401, "User not found");
  }

  const Event = await VoteEvent.findById(eventID);
  if (!Event) {
    throw new ApiError(401, "Vote event not found");
  }

  const PostDoc = await post.findById(postID);
  if (!PostDoc) {
    throw new ApiError(404, "Post not found");
  }

  const isOwner = String(PostDoc.owner) === String(UserID);
  const isAdmin = Role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Not authorized to delete this post");
  }

  // Delete media from Cloudinary
  try {
    const pics = Array.isArray(PostDoc.picture) ? PostDoc.picture : [];
    const vids = Array.isArray(PostDoc.video) ? PostDoc.video : [];
    for (const p of pics) {
      if (p?.publicId) {
        await FileDelete(p.publicId);
      }
    }
    for (const v of vids) {
      if (v?.publicId) {
        await FileDelete(v.publicId);
      }
    }
  } catch (e) {
    console.error('Cloudinary delete error:', e?.message || e);
  }

  await Comment.deleteMany({ postID: PostDoc._id });
  await PostDoc.deleteOne();

  console.log("post deleted successfully");
  return res.status(200).json(new ApiResponse(200, { deleted: true }, "Post deleted successfully"));
});

// Delete a comment by owner or admin
const deleteComment = AsynHandler(async (req, res) => {
  const { commentID, eventID } = req.body;
  if (!commentID || !eventID) {
    throw new ApiError(401, "commentID and eventID are needed");
  }

  const UserID = req.user?._id;
  const Role = req.user?.Role;
  if (!UserID) {
    throw new ApiError(401, "User not found");
  }

  const Event = await VoteEvent.findById(eventID);
  if (!Event) {
    throw new ApiError(401, "Vote event not found");
  }

  const cmt = await Comment.findById(commentID);
  if (!cmt) {
    throw new ApiError(404, "Comment not found");
  }

  const isOwner = String(cmt.owner) === String(UserID);
  const isAdmin = Role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Not authorized to delete this comment");
  }

  await cmt.deleteOne();
  console.log("comment deleted successfully");
  return res.status(200).json(new ApiResponse(200, { deleted: true }, "Comment deleted successfully"));
});

const editPost = AsynHandler(async (req, res) => {
  console.log("edit post working ");
  const { postID } = req.body
  const eventID = req.body?.eventID || req.query?.eventID
  const content = req.body?.content
  let removeMediaIds = req.body?.removeMediaIds

  if(!postID || !eventID) throw new ApiError(400,'postID and eventID are required')
  const UserID = req.user?._id
  const Role = req.user?.Role

  const Event = await VoteEvent.findById(eventID)
  if(!Event) throw new ApiError(404,'Vote event not found')

  const PostDoc = await post.findById(postID)
  if(!PostDoc) throw new ApiError(404,'Post not found')

  if(String(PostDoc.eventID) !== String(eventID)) throw new ApiError(400,'Post does not belong to provided event')

  if(String(PostDoc.owner) !== String(UserID) && Role !== 'admin') throw new ApiError(403,'Not authorized to edit this post')

  // Update text content
  if(typeof content === 'string') PostDoc.content = content

  // Normalize removeMediaIds (can be array or a single string from FormData)
  if(typeof removeMediaIds === 'string') removeMediaIds = [ removeMediaIds ]
  if(Array.isArray(removeMediaIds) && removeMediaIds.length){
    const ids = new Set(removeMediaIds.map(String))
    const keepPic = []
    for(const p of (PostDoc.picture||[])){
      if(ids.has(String(p.publicId))){
        try{ if(p.publicId) await FileDelete(p.publicId) }catch(e){ console.error('Cloud delete picture failed', e?.message||e) }
      } else keepPic.push(p)
    }
    PostDoc.picture = keepPic
    const keepVid = []
    for(const v of (PostDoc.video||[])){
      if(ids.has(String(v.publicId))){
        try{ if(v.publicId) await FileDelete(v.publicId) }catch(e){ console.error('Cloud delete video failed', e?.message||e) }
      } else keepVid.push(v)
    }
    PostDoc.video = keepVid
  }

  // Append new uploads (if any)
  const newPics = []
  const pictureFiles = Array.isArray(req.files?.picture) ? req.files.picture : []
  for(const pic of pictureFiles){
    try{ const up = await FileUpload(pic.path); if(up){ newPics.push({ url: up.url, publicId: up.public_id }) } }
    catch(e){ console.error('Edit upload picture failed', e?.message||e) }
  }
  const newVids = []
  const videoFiles = Array.isArray(req.files?.video) ? req.files.video : []
  for(const vid of videoFiles){
    try{ const up = await FileUpload(vid.path); if(up){ newVids.push({ url: up.url, publicId: up.public_id }) } }
    catch(e){ console.error('Edit upload video failed', e?.message||e) }
  }
  if(newPics.length) PostDoc.picture = [ ...(PostDoc.picture||[]), ...newPics ]
  if(newVids.length) PostDoc.video = [ ...(PostDoc.video||[]), ...newVids ]

  await PostDoc.save({ validateBeforeSave:false })
  return res.status(200).json(new ApiResponse(200, PostDoc, 'Post updated'))
})

const editComment = AsynHandler(async (req, res) => {
  const { commentID, eventID, comment } = req.body
  if(!commentID || !eventID) throw new ApiError(400,'commentID and eventID are required')
  const UserID = req.user?._id
  const Role = req.user?.Role
  const cmt = await Comment.findById(commentID)
  if(!cmt) throw new ApiError(404,'Comment not found')
  if(String(cmt.owner) !== String(UserID) && Role !== 'admin') throw new ApiError(403,'Not authorized')
  cmt.comment = comment || ''
  await cmt.save({ validateBeforeSave:false })
  return res.status(200).json(new ApiResponse(200, cmt, 'Comment updated'))
})

const reactComment = AsynHandler(async (req, res) => {
  const { commentID, eventID, like, dislike } = req.body
  if(!commentID || !eventID) throw new ApiError(400,'commentID and eventID are required')
  const UserID = req.user?._id
  const Role = req.user?.Role
  if(!UserID) throw new ApiError(401,'User not found')
  const Event = await VoteEvent.findById(eventID)
  if(!Event) throw new ApiError(404,'Vote event not found')
  const cmt = await Comment.findById(commentID)
  if(!cmt) throw new ApiError(404,'Comment not found')
  // Toggle reactions
  const idxL = cmt.likes.findIndex(u => String(u)===String(UserID))
  const idxD = cmt.dislikes.findIndex(u => String(u)===String(UserID))
  if(like){
    if(idxL===-1) cmt.likes.push(UserID)
    if(idxD!==-1) cmt.dislikes.splice(idxD,1)
  } else if(dislike){
    if(idxD===-1) cmt.dislikes.push(UserID)
    if(idxL!==-1) cmt.likes.splice(idxL,1)
  }
  await cmt.save({ validateBeforeSave:false })
  return res.status(200).json(new ApiResponse(200, { likeCount: cmt.likes.length, dislikeCount: cmt.dislikes.length }, 'Reaction updated'))
})

export{
    posting,
    userComment,
    postList,
    reactEmoji,
    countLikeDislike,
    deletePost,
    deleteComment,
    editPost,
    editComment,
    reactComment
}