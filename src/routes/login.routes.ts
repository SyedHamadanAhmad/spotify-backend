import { Router, Response, Request } from "express";
import { handleLogin } from "../controllers/login.controller";
import {Express} from 'express-serve-static-core'
export const loginRouter=Router();


loginRouter.route('/').post(handleLogin)



