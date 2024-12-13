import pool from "../connection"
import { Request, Response } from "express"
export interface User {
    user_id:string,
    user_name:string,
    access_token:string,
    refresh_token:string,
    blacklist:boolean
}


export const logout = async (user_id: string) => {
    try {
        const query = "UPDATE users SET access_token = null, refresh_token = null WHERE user_id = $1;";
        const response = await pool.query(query, [user_id]);

        if (response.rowCount && response.rowCount > 0) {
            console.log(`Successfully removed tokens for user_id: ${user_id}`);
            return true;
        } else {
            console.log(`No tokens found to remove for user_id: ${user_id}`);
            return false;
        }
    } catch (err) {
        if (err instanceof Error) {
            console.error("Error in logout function: ", err.message);
            throw new Error(`Error in logout function: ${err.message}`);
        } else {
            console.error("Unknown error in logout function: ", err);
            throw new Error("Unknown error in logout function");
        }
    }
};

export const upsertToken = async (user_id: string, user_name:string, access_token: string, refresh_token: string) => {
    try {
        // Use INSERT ... ON CONFLICT to handle both inserting or updating the user
        const query = `
            INSERT INTO users(user_id,user_name, access_token, refresh_token)
            VALUES($1, $2, $3, $4)
            ON CONFLICT (user_id) 
            DO UPDATE 
            SET access_token = EXCLUDED.access_token, refresh_token = EXCLUDED.refresh_token
            RETURNING access_token, user_id;
        `;
        
        // Execute the query with the provided parameters
        const result = await pool.query(query, [user_id, user_name, access_token, refresh_token]);

        // Return the user data (either inserted or updated)
        // console.log('Tokens inserted or updated successfully:', result.rows[0]);
        return result.rows[0]; // Return the inserted or updated user data
    } catch (err) {
        // Handle errors
        if (err instanceof Error) {
            console.log("Error in upserting tokens: ", err.message);
            throw new Error(`Error in upserting tokens: ${err.message}`);
        } else {
            console.log("Unknown error in upserting tokens: ", err);
            throw new Error('Unknown error in upserting tokens');
        }
    }
};

export const findRefreshToken=async(access_token:string | undefined)=>{
    try{
        const query=`SELECT refresh_token FROM users WHERE access_token=$1;`
        const results=await pool.query(query, [access_token]);
        if(results.rowCount && results.rowCount>0){
            return results
        }

    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Error in finding Refresh token: ", err.message);
            throw new Error(`Error in finding Refresh token: ${err.message}`);
        } else {
            console.error("Unknown error in finding Refresh token: ", err);
            throw new Error("Unknown error in finding Refresh token");
        }
    }
}
