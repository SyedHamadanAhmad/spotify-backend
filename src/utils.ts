export interface songFeatures{
    danceability:number,
    energy: number,
    key: number,
    loudness: number,
    mode: number,
    speechiness: number,
    acousticness: number,
    instrumentalness: number,
    liveness: number,
    valence: number,
    tempo: number,
    type: string,
    id: string,
    uri: string,
    track_href: string,
    analysis_url: string,
    duration_ms: number,
    time_signature: number
  }

export interface songData{
    track_name:string,
    track_id:string,
    album:string,
    img:string,
    preview_url?:string

}


  export const getTrackFeatures = async (track_id:string, authToken:string)=>{
    try{
        console.log("Track id in getTrackFeatures: ",track_id)
        const response= await fetch(`https://api.spotify.com/v1/audio-features/${track_id}`, {
            method:"GET",
            headers:{
                "Authorization": `Bearer ${authToken}`
            }
        });
        if(response.ok){
            const data= await response.json();
            return data;
        }
        
    }
    catch(err){
        if(err instanceof Error){
            console.log("Error getting track features: ", err.message)
            throw err.message;
        }
        else{
            console.log("Unknown server error: ", err)
            throw err;
        }
    }
}


export const getRecommendations = async (limit:number, track_id:string, authToken:string, features?:songFeatures)=>{
    try{
        if(features){
            console.log("Features found")
            const queryParams = new URLSearchParams({
                limit:limit.toString(),
                seed_tracks: features.id, // Using the current track as the seed
                target_danceability: features.danceability.toString(),
                target_energy: features.energy.toString(),
                target_valence: features.valence.toString(),
                target_tempo: features.tempo.toString(),
            });
    
            const response=await fetch(`https://api.spotify.com/v1/recommendations?${queryParams.toString()}`, {
                method:"GET",
                headers:{
                    "Authorization": `Bearer ${authToken}`
                }
            })
    
            if(response.ok){
                const data=await response.json();
                return data;
            }
        }
        else{
            const response=await fetch(`https://api.spotify.com/v1/recommendations?limit=${limit}&seed_tracks=${track_id}`, {
                method:"GET",
                headers:{
                    "Authorization": `Bearer ${authToken}`
                }
            })
            if(response.ok){
                const data=await response.json();
                return data;
            }
        }
        
    }
    catch(err){
        if(err instanceof Error){
            console.log("Error getting track Recommendations: ", err.message)
            throw err.message;
        }
        else{
            console.log("Unknown server error: ", err)
            throw err;
        }
    }
}

export const findSongs = async (trackName: string, authToken: string) => {
    try {
        console.log("Track name in findSongs: ", trackName);

        // Properly encode the track name for the URL
        const encodedTrackName = encodeURIComponent(trackName);

        // Fetch songs from Spotify API
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodedTrackName}&type=track&limit=10&include_external=audio`, {
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.tracks.items;
        } else {
            // Log response details for debugging
            const errorDetails = await response.json();
            console.error("Spotify API error:", {
                status: response.status,
                statusText: response.statusText,
                error: errorDetails
            });
            throw new Error(`Spotify API returned an error: ${response.status} ${response.statusText}`);
        }
    } catch (err) {
        if (err instanceof Error) {
            console.error("Error in findSongs: ", err.message);
            throw err.message;
        } else {
            console.error("Unknown server error: ", err);
            throw err;
        }
    }
};
