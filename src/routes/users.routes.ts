import { Router } from "express";
import { getUserData, getTopItems } from "../controllers/users.controller";
export const userRouter=Router()
userRouter.route('/getUserData').post(getUserData);
userRouter.route('/getTopItems').post(getTopItems);