import { Router } from "express";
import { getSongs, recommendSong } from "../controllers/songs.controller";
export const songsRouter=Router()
songsRouter.route('/search/:songName').get(getSongs)
songsRouter.route('/recommend/:artist_name/:track_name').get(recommendSong)