import { Router } from "express";
import { handleLogout } from "../controllers/logout.controller";
export const logoutRouter=Router()

logoutRouter.route('/').post(handleLogout)