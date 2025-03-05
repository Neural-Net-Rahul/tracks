import express from 'express'
import { createTrack, getUserData, login, register, uploadImage, verifyUser } from '../controllers/userController';
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
userRoute.post("/getUserData", verify, getUserData);
userRoute.post("/uploadImage", verify, upload.fields([{name:"image",maxCount:1}]),uploadImage);

export default userRoute;