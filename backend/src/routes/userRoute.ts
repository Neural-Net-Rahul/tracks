import express from 'express'
import { createTrack, login, register, verifyUser } from '../controllers/userController';
import { upload } from '../middlewares/multer';
import verify from '../middlewares/auth';

const userRoute = express.Router();

userRoute.post(
  "/register",
  upload.fields([{ name: "profilePic", maxCount: 1 }]),
  register
);

userRoute.post(
  "/verify",
  verifyUser
);

userRoute.post("/login", login);

userRoute.post("/create", verify, createTrack);


export default userRoute;