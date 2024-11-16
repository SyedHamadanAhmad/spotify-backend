import express, { Request } from "express";
import pool from "./connection";
import {loginRouter} from './routes/login.routes';
import { logoutRouter } from "./routes/logout.routes";
import cors from "cors";

const app: express.Application = express()

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json()); // Middleware to parse JSON bodies

const port = process.env.PORT || 3000;


app.get('/', (req, res)=>{
    res.send("Typescript with express")
})


app.use('/login', loginRouter)
app.use('/logout', logoutRouter)
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

