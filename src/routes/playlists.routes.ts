import { Router } from "express";
import { createPlaylistController } from "../controllers/playlists.controller";
export const playlistRouter=Router()

playlistRouter.route('/createPlaylist').post(createPlaylistController)

