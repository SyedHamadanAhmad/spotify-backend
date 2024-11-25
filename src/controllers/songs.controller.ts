import { Request, Response } from "express"
import { findSongs, songData, songFeatures, getRecommendations } from "../utils"
export const getSongs=async(req:Request, res:Response): Promise<void>=>{
    try{
        const name=req.params.songName
        const query=name.split(" ").join('+')
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
        const songs=await findSongs(query, authToken)
        let response:songData[]=[]
        for(let i=0; i<songs.length; i++){
            var song:songData={
                track_name:songs[i].name,
                track_id:songs[i].id,
                album:songs[i].album.name,
                img:songs[i].album.images[0].url,
                artist: songs[i].artists.map((artist: { name: string }) => artist.name).join(", "),
                preview_url:songs[i].preview_url

            }
            response.push(song)
        }
        
        res.json({
            response:response
        })

    }
    catch(err){
        if(err instanceof Error){
            console.log("Error searching songs: ", err.message)
            throw err.message
        }
        else{
            console.log("Unknown server erro: ", err)
            throw err
        }
    }
}

export const recommendSong=async(req:Request, res:Response)=>{
    try{
        const track_id=req.params.track_id
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

        const songs=await getRecommendations(10, track_id, authToken);
        
        let response:songData[]=[]
        for(let i=0; i<songs.tracks.length; i++){
            var song:songData={
                track_name:songs.tracks[i].name,
                track_id:songs.tracks[i].id,
                album:songs.tracks[i].album.name,
                img:songs.tracks[i].album.images[0].url,
                artist: songs.tracks[i].artists.map((artist: { name: string }) => artist.name).join(", "),
                preview_url:songs.tracks[i].preview_url

            }
           
            response.push(song)
        }
        
        res.status(200).json({
            recommendations:response
        })
    }
    catch(err){
        if(err instanceof Error){
            console.log("Error getting recommendations: ", err.message)
            throw err.message
        }
        else{
            console.log("Unknown server erro: ", err)
            throw err
        }
    }
}