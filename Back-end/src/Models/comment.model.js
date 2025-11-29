import mongoose from "mongoose";

const  commentSchema= new mongoose.Schema({
    
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    eventID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"VoteEvent",
        required:true
    },
    postID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"post",
        required: true
    },
    comment:{
        type:String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    // reaction arrays
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    dislikes: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] }
   
},{timestamps:true})

// Helpful indexes for lookups
commentSchema.index({ postID: 1 })
commentSchema.index({ eventID: 1 })

export const Comment=mongoose.model("comment",commentSchema);