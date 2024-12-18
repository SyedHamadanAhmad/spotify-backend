import { createPlaylistRecord } from "./models/playlist.model"

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
    artist?:string

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


export const getRecommendations = async (
    limit: number,
    track_name: string,
    artist_name: string,
    authToken: string
  ) => {
    try {
        console.log("Track: ", track_name);
        console.log("Artist: ", artist_name)
      const LASTFM_API_BASE = "https://ws.audioscrobbler.com/2.0/";
      const LASTFM_API_KEY =
        process.env.LASTFM_API_KEY || "b249c0d8d57a523d8e8be50c76151008";
  
      // Fetch similar tracks
      const response = await fetch(
        `${LASTFM_API_BASE}?method=track.getSimilar&artist=${artist_name}&track=${track_name}&api_key=${LASTFM_API_KEY}&format=json&autocorrect=1&limit=${limit}`
      );
  
      const data = await response.json();
      console.log("Similar Song Data in getRecommendations: ", data);
  
      let tracks = [];
      if (data.similartracks?.track?.length === 0) {
        console.log(
          `No similar tracks found for "${track_name}". Fetching top tracks for artist "${artist_name}".`
        );
  
        const fallbackResponse = await fetch(
          `${LASTFM_API_BASE}?method=artist.getTopTracks&artist=${artist_name}&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}`
        );
  
        const fallbackData = await fallbackResponse.json();
        tracks = fallbackData.toptracks?.track || [];
      } else {
        tracks = data.similartracks.track || [];
      }
  
      // Use Dutch National Flag Algorithm to remove duplicates by song name
      const removeDuplicates = (tracks: any[]) => {
        const uniqueNames = new Set<string>();
        const distinctTracks = [];
  
        for (let i = 0; i < tracks.length; i++) {
          if (!uniqueNames.has(tracks[i].name)) {
            uniqueNames.add(tracks[i].name);
            distinctTracks.push(tracks[i]);
          }
        }
  
        return distinctTracks;
      };
  
      const uniqueTracks = removeDuplicates(tracks).slice(0, limit);
  
      // Fetch Spotify data for each unique track
      const spotifyTracks = await Promise.all(
        uniqueTracks.map((track: any) => findSongs(1,track.name, authToken))
      );
  
      return spotifyTracks.flat();
    } catch (err) {
      if (err instanceof Error) {
        console.log("Error getting Recommendations from Last.fm", err.message);
        throw err.message;
      } else {
        console.log(
          "Unknown Server Error getting Recommendations from Last.fm",
          err
        );
        throw err;
      }
    }
  };
  

// export const getRecommendations = async (limit:number, track_id:string, authToken:string, features?:songFeatures)=>{
//     try{
//         if(features){
//             console.log("Features found")
//             const queryParams = new URLSearchParams({
//                 limit:limit.toString(),
//                 seed_tracks: features.id, // Using the current track as the seed
//                 target_danceability: features.danceability.toString(),
//                 target_energy: features.energy.toString(),
//                 target_valence: features.valence.toString(),
//                 target_tempo: features.tempo.toString(),
//             });
    
//             const response=await fetch(`https://api.spotify.com/v1/recommendations?${queryParams.toString()}`, {
//                 method:"GET",
//                 headers:{
//                     "Authorization": `Bearer ${authToken}`
//                 }
//             })
    
//             if(response.ok){
//                 const data=await response.json();
//                 return data;
//             }
//         }
//         else{
//             const response=await fetch(`https://api.spotify.com/v1/recommendations?limit=${limit}&seed_tracks=${track_id}`, {
//                 method:"GET",
//                 headers:{
//                     "Authorization": `Bearer ${authToken}`
//                 }
//             })
//             if(response.ok){
//                 const data=await response.json();
//                 return data;
//             }
//             else{
//                 const e=await response.json();
//                 console.log("Error in getting recommendations from spotify API: ", e)
//             }
//         }
        
//     }
//     catch(err){
//         if(err instanceof Error){
//             console.log("Error getting track Recommendations: ", err.message)
//             throw err.message;
//         }
//         else{
//             console.log("Unknown server error: ", err)
//             throw err;
//         }
//     }
// }

export const findSongs = async (limit:number,trackName: string, authToken: string) => {
    try {
        console.log("Track name in findSongs: ", trackName);

        // Properly encode the track name for the URL
        const encodedTrackName = encodeURIComponent(trackName);

        // Fetch songs from Spotify API
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodedTrackName}&type=track&limit=${limit.toString()}&include_external=audio`, {
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


export const createPlaylist = async(user_id:string, playlistName:string, collaborative:boolean, description:string, publicity:boolean, authToken:string)=>{
    try{
        const response=await fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
            method:"POST",
            headers:{
                "Authorization": `Bearer ${authToken}`
            },
            body:JSON.stringify({
                name:playlistName,
                description:description,
                public:publicity
            })
        })

        if(response.ok){
            const data=await response.json();   
            const playlist_id=data.id
            const success=await createPlaylistRecord(playlist_id, user_id);
            return{
                playlistId:playlist_id,
                db_response:success
            }
        }
        else{
            const e=await response.json()
            console.log(e)
        }
    }
    catch(err){
        if(err instanceof Error){
            console.log("Error creating playlist in utils: ", err.message)
            throw err.message
        }
        else{
            console.log("Unknown server error creating playlist: ", err)
            throw err
        }
    }
}


export const addSongstoPlaylist = async(playlist_id: string, authToken:string, songs:songData[])=>{
try{
    let uris:string[]=[];
    songs.map((song:songData)=>{
        var uri=`spotify:track:${song.track_id}`
        uris.push(uri)
    })
    const response=await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, 
        {
            method:"POST",
            headers:{
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                uris:uris
            })

        }
    )

    if(response.ok){
        const data=await response.json();
        console.log(data)
        return data
    }
    else{
        const err=await response.json();
        console.log(err);
    }
    
}
catch(err){
    if(err instanceof Error){
        console.log("Error adding songs to playlist: ", err.message)
        throw err.message
    }
    else{
        console.log("Unknown error adding songs to playlist: ", err)
        throw err;
    }
}
}