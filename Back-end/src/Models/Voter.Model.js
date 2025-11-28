import mongoose from "mongoose";

const VoterSchema= new mongoose.Schema({
     UserID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User", 
            required:true 
        },
     EventID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"VoteEvent",
            required:true
        },

    hasVoted: {
          type: Boolean,
          default: false
  },
  emailCode:{ type:String },
  emailCodeExpiresAt:{ type:Date },

},{timestamps:true})

export const VoterReg=mongoose.model("VoterReg",VoterSchema)