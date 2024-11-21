import { Router } from "express";
import { getUserData } from "../controllers/users.controller";
export const userRouter=Router()

userRouter.route('/getUserData').post(getUserData);