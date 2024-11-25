import { Request, Response } from "express"
import { createPlaylist, addSongstoPlaylist } from "../utils"


export const createPlaylistController = async (req:Request, res:Response)=>{
    try{

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({ error: "Authorization header is missing" });
            return;
        }

        const authToken = authHeader.split(' ')[1];
    
        if (!authToken) {
            res.status(401).json({ error: "Invalid authorization header format" });
            return;
        }
        const userName=req.body.user_name
        const userId=req.body.user_id
        const playlistName=req.body.playlistName
        const selectedSongs=req.body.selected_songs
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();

        const description=`Playlist created by Spotimate for ${userName} on ${dd}/${mm}/${yyyy}`
        const playlistResponse=await createPlaylist(userId, playlistName, false, description, true, authToken)
        if(playlistResponse?.playlistId){
            const addSongsResponse=await addSongstoPlaylist(playlistResponse.playlistId, authToken, selectedSongs)
            if(addSongsResponse.snapshot_id){
                res.status(200).json({
                    success:true
                })
            }
        }
       

        
    }
    catch(err){
        if(err instanceof Error){
            console.log("Error creating playlist: ", err.message)
            throw err.message
        }
        else{
            console.log("Unknown server error creating playlist: ", err)
            throw err
        }
    }
}