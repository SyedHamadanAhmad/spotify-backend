import { Router } from "express";
import { getSongs, recommendSong } from "../controllers/songs.controller";
export const songsRouter=Router()

songsRouter.route('/search/:songName').get(getSongs)
songsRouter.route('/recommend/:track_id').get(recommendSong)