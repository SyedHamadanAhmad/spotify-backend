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


  export const getTrackFeatures = async (track_id:string, authToken:string)=>{
    try{
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
        else console.log("Error getting track features")
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


export const getRecommendations = async (features:songFeatures, authToken:string)=>{
    try{
        const queryParams = new URLSearchParams({
            limit:'3',
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
