import { Request, Response, RequestHandler } from 'express';
import { upsertToken} from '../models/user.model';
import axios from 'axios';


export const handleLogin: RequestHandler = async (req, res) => {
    try {
        const code = req.body.code;
        const url = 'https://accounts.spotify.com/api/token';
        const redirectUri = process.env.NODE_ENV === 'production'
    ? 'https://spotify-frontend-flax.vercel.app/callback'
    : "http://localhost:5173/callback";
   
        const data = new URLSearchParams({
            client_id: '30820122439c46ceae16b4c4fb510488',
            client_secret: 'f879d8e0f64647eab46f0b241a1450d5',
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri
          });
          try {
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: data
            });
          
            // Parse the response to JSON
            const responseData = await response.json();
            if (responseData.access_token && responseData.refresh_token) {
                const { access_token, refresh_token } = responseData;

                // Call the upsert function to either insert or update the tokens in the database
                const user = await upsertToken(code, access_token, refresh_token);

                // Send the response with the user data and tokens
                res.status(200).json({
                    message: 'Tokens processed successfully',
                    user: user // You can send back the user data or other relevant info
                });
            } else {
                // If no access token or refresh token, respond with an error
                res.status(400).json({
                    message: 'Failed to obtain access tokens from Spotify'
                });
            }

            // Print the response data to the console
            
          } catch (error) {
            console.error('Error:', error);
          }
        // Send response with the access token
        res.status(200)
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error in getting tokens", err.message);
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Unknown internal error" });
    }
  }
};








