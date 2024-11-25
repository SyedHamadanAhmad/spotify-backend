import express, { Request } from "express";
import pool from "./connection";
import {loginRouter} from './routes/login.routes';
import { logoutRouter } from "./routes/logout.routes";
import { userRouter } from "./routes/users.routes";
import { songsRouter } from "./routes/songs.routes";
import { playlistRouter } from "./routes/playlists.routes";
import cors from "cors";

const app: express.Application = express()

const allowedOrigins = [
    'http://localhost:5173',  // Local development environment
    'https://spotify-frontend-flax.vercel.app',  // Vercel production environment
  ];
  
  app.use(cors({
    origin: allowedOrigins,
    credentials: true,  // Allow cookies or other credentials to be sent
  }));


  app.use(express.json()); // Middleware to parse JSON bodies

const port = process.env.PORT || 3000;


app.get('/', (req, res)=>{
    res.send("Typescript with express")
})


app.use('/login', loginRouter)
app.use('/logout', logoutRouter)
app.use('/user', userRouter)
app.use('/songs', songsRouter)
app.use('/playlists', playlistRouter)
app.listen(port, async ()=>{
    try{
        await pool.connect()
        console.log("Connected to POSTGRES DB successfully")
    }
    catch(err){
        console.log("ERROR: ", err)
    }
    console.log("Typescript with Express")
})

