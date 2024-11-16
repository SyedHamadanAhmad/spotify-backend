import pool from "../connection"
import { Request, Response } from "express"
export interface User {
    code:string,
    refresh_token:string,
    blacklist:boolean
}


export const removeTokens=async(access_token:string)=>{
    try{
        const query="DELETE FROM users WHERE access_token=$1;"
        const response=await pool.query(query, [access_token])
        if (response.rowCount !== null && response.rowCount > 0) {
            console.log(`Successfully removed token with value: ${access_token}`);
            return true;
          } else {
            console.log(`No matching token found to remove: ${access_token}`);
            return false;
          }
    }
    catch (err) {
        // Handle errors
        if (err instanceof Error) {
            console.log("Error in upserting tokens: ", err.message);
            throw new Error(`Error in upserting tokens: ${err.message}`);
        } else {
            console.log("Unknown error in upserting tokens: ", err);
            throw new Error('Unknown error in upserting tokens');
        }
    }
}


export const upsertToken = async (code: string, access_token: string, refresh_token: string) => {
    try {
        // Use INSERT ... ON CONFLICT to handle both inserting or updating the user
        const query = `
            INSERT INTO users(code, access_token, refresh_token)
            VALUES($1, $2, $3)
            ON CONFLICT (code) 
            DO UPDATE 
            SET access_token = EXCLUDED.access_token, refresh_token = EXCLUDED.refresh_token
            RETURNING *;
        `;
        
        // Execute the query with the provided parameters
        const result = await pool.query(query, [code, access_token, refresh_token]);

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
