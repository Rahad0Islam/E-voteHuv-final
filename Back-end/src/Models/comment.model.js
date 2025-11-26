import mongoose from "mongoose";

const  commentSchema= new mongoose.Schema({
    
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
    ,
    eventID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"VoteEvent",
        required:true
    },
    postID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"post",
    },
    comment:{
        type:String
    }
   
},{timestamps:true})

export const Comment=mongoose.model("comment",commentSchema);