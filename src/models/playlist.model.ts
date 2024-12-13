import pool from "../connection"

interface userPlaylist{
    user_id:string,
    playlist_id:string
}

export const createPlaylistRecord = async (playlist_id:string, user_id:string)=>{
    try{
        const query= `INSERT INTO userPlaylist(user_id, playlist_id) VALUES($1, $2);`
        const result=await pool.query(query, [user_id, playlist_id])
        if (result.rowCount && result.rowCount > 0) {
            return 1; // Success
        } else {
            return 0; // No rows inserted
        }
    }
    catch(err){
        if(err instanceof Error){
            console.log("Error generating record of playlist on database: ", err.message)
            throw err.message
        }
        else{
            console.log("Unknown server error generating record of playlist on database: ", err)
            throw err
        }
    }
}

