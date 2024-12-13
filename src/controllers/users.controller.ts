import { Request, Response } from "express";
import {  getRecommendations } from "../utils";
const getLastPlayed = async (authToken: string) => {
    try {
        const timestamp=Date.now() ;
        const response1 = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=1&before=${timestamp}`, {
            method:"GET",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/x-www-form-urlencoded",
                "Cache-Control": "no-cache"
            }
        });

        if (response1.ok) {
            const data1 = await response1.json();
           
            return {
                name: data1.items[0]?.track.name,
                artist: data1.items[0]?.track.artists?.map((artist: any) => artist.name).join(', '),
                album: data1.items[0]?.track.album.name,
                image: data1.items[0]?.track.album.images[0]?.url,
                url:data1.items[0]?.track.external_urls,
                track_id:data1.items[0].track.id
            };
        } 
    } catch (err) {
        if(err instanceof Error){
            console.error("Error getting last played song:", err);
        }
       
       
    }
};

const getFollowers = async (user_id: string, authToken: string) => {
    try {
        const response2 = await fetch(`https://api.spotify.com/v1/users/${user_id}`, {
            headers: {
                "Authorization": `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response2.ok) {
            const data2 = await response2.json();
            return data2.followers?.total || 0;
        } else {
            throw new Error(`Failed to fetch followers: ${response2.statusText}`);
        }
    } catch (err) {
        console.error("Error getting followers:", err);
        throw err;
    }
};


const getListeningTime= async (authToken:string)=>{
    try{
        let totalListeningTime = 0;
        let hasMoreData = true;
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysSinceMonday = (dayOfWeek + 6) % 7; // Adjust for Monday being the start of the week
        const lastMonday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - daysSinceMonday,
            0, 0, 0, 0
            );
    let timestamp = lastMonday.getTime();
        while(hasMoreData){
            const response=await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=50&after=${timestamp}`, {
                headers:{
                    "Authorization": `Bearer ${authToken}`
                }
            });
            if(response.ok){
                const data= await response.json();
                const tracks = data.items;
                tracks.forEach((item:any) => {
                    totalListeningTime += item.track.duration_ms;
                  });
                  if (tracks.length < 50) {
                    hasMoreData = false;
                  } else {
                    timestamp = new Date(tracks[tracks.length - 1].played_at).getTime();
                  }
                  const hours = Math.floor(totalListeningTime / (1000 * 60 * 60));
                    const minutes = Math.floor((totalListeningTime % (1000 * 60 * 60)) / (1000 * 60));

                    
                    return {hours, minutes}
            }
        }
       
    }
    catch(err){
        if(err instanceof Error){
            console.log("Error getting listening time: ", err.message);
            throw err;
        }
        else{
            console.log("Unknown server error: ", err)
            throw err;
        }
    }
}




export const getUserData = async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = req.body.user_id;
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

        const lastPlayed = await getLastPlayed(authToken);
        
        const followers = await getFollowers(user_id, authToken);
        
        const track_id=lastPlayed?.track_id
        const track_name=lastPlayed?.name
        const firstArtist = lastPlayed?.artist.split(',')[0].trim();
        
       
        const recommendations = await getRecommendations(1, track_name, firstArtist, authToken);
       
        
        let recommendedSongDetails;
        for (let i = 0; i < recommendations.length; i++) {
            if (recommendations[i].id !== track_id) {
                recommendedSongDetails = recommendations[i];
                break; // Exit the loop once you find a recommendation
            }
        }
        
        
        let recommendedSong = {
            name: recommendedSongDetails.name,
            artist: recommendedSongDetails.artists?.map((artist: any) => artist.name).join(', '),
            album: recommendedSongDetails.album.name,
            image: recommendedSongDetails.album.images[0]?.url,
            url: recommendedSongDetails.external_urls.spotify,
            track_id: recommendedSongDetails.id,
            preview_url:recommendedSongDetails.preview_url
        };
       
        const listeningTime=await getListeningTime(authToken)
        
        res.status(200).json({
            lastPlayed,
            recommendedSong,
            listeningTime,
            followers
        });
    } catch (err: any) {
        console.error("Error getting user data:", err.message || err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
};


export const getTopItems=async(req:Request, res:Response)=>{
    try{
        const time_range=req.body.time_range;
        const item=req.body.item;
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

        const response = await fetch(`https://api.spotify.com/v1/me/top/${item}?time_range=${time_range}&limit=10`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.ok) {
            const data = await response.json();
            
            res.status(200).json(data.items); // Send data back to the client
        } else {
            const errorData = await response.json(); // Await the response body
            console.error("Spotify API error:", errorData);
            res.status(response.status).json(errorData); // Forward Spotify's error
        }
    }
    catch(err){
        if(err instanceof Error){
            console.log("Error getting top item: ", err.message)
            throw err.message
        }
        else{
            console.log("Unknown server error: ", err)
            throw err;
        }
    }
}
