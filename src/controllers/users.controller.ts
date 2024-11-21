import { Request, Response } from "express";
import { songFeatures, getTrackFeatures, getRecommendations } from "../utils";
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
        const trackFeatures=await getTrackFeatures(track_id, authToken)
        const recommendations=await getRecommendations(trackFeatures, authToken)
        
        let recommendedSongDetails;
        for (let i = 0; i < recommendations.tracks.length; i++) {
            if (recommendations.tracks[i].id !== track_id) {
                recommendedSongDetails = recommendations.tracks[i];
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
       
        
        res.status(200).json({
            lastPlayed,
            recommendedSong,
            followers
        });
    } catch (err: any) {
        console.error("Error getting user data:", err.message || err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
};

