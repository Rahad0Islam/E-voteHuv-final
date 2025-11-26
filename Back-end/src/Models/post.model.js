import mongoose from 'mongoose'


const postSchema=new mongoose.Schema  ({
      
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
      picture:
      [{
        url: { type: String },
        publicId: { type: String }
     }],

       video:
      [{
        url: { type: String },
        publicId: { type: String }
     }],

      content:{
        type:String
      },
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]

},{timestamps:true})

export const post=mongoose.model("post",postSchema)