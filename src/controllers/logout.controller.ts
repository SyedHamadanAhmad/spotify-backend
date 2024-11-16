import {Request, Response} from 'express'
import { removeTokens } from '../models/user.model';
export const handleLogout = async(req:Request, res:Response)=>{
    try{
        const accessToken=req.body.accessToken
        const response=await removeTokens(accessToken);
        if(response){
            console.log("Logout")
            res.json("Successfully logged out")
        }
        else res.json("User not found")
    }
    catch(err:unknown){
        if(err instanceof Error){
            console.log("Error in logging out, ", err.message)
            throw err;
        }
        else{ 
            console.log("Unknown error in logging out,", err)
            throw err;
        }
    }
}