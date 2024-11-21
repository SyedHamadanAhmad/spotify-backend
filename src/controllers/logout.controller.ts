import {Request, Response} from 'express'
import { logout } from '../models/user.model';
export const handleLogout = async(req:Request, res:Response)=>{
    try{
        const user_id=req.body.user_id
        console.log("Request body:", req.body);

        console.log("in /logout endpoint:", user_id)
        const response=await logout(user_id);
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