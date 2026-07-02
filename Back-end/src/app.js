import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'


const app=express()

const allowedOrigins = [
  "http://localhost:5173",
  "https://evotehub.vercel.app",
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// app.options("*", cors({
//   origin: allowedOrigins,
//   credentials: true,
// }));
app.use(express.json({limit:"16kb"}))  
   // parse JSON payloads in POST, PUT, or PATCH requests-  > req.body directly.
 
app.use(express.urlencoded({extended:true}))
  //get from traditional HTML forms (application/x-www-form-urlencoded).


app.use(express.static('public'))
app.use(cookieParser())


//importing Routers
import UserRoutes from './Routes/User.Route.js'
import voteEvent from './Routes/VoteEvent.Route.js'
import campaignRoutes from './Routes/campaign.Route.js'
app.use("/api/v1/users",UserRoutes)
app.use("/api/V1/admin",voteEvent)
app.use("/api/v1/post",campaignRoutes)


export {app}