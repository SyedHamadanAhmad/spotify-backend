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
        const songs=await findSongs(10, query, authToken)
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
        const artist_name=req.params.artist_name
        const track_name=req.params.track_name;
        
        console.log(artist_name, track_name)
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

        const songs=await getRecommendations(10, track_name,artist_name, authToken);
        console.log(songs)
        const response: songData[] = songs.map((song: any) => ({
            track_name: song.name,
            track_id: song.id,
            album: song.album.name,
            img: song.album.images[0]?.url || '', // Fallback if no image is available
            artist: song.artists.map((artist: { name: string }) => artist.name).join(", "),
            preview_url: song.preview_url || '', // Fallback if no preview URL is available
        }));
        
        // Log the transformed response to verify
        console.log(response);
        
        res.status(200).json({
            recommendations: response,
        });
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