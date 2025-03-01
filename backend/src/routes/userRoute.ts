import express from 'express'
import { login, register } from '../controllers/userController';
import { upload } from '../middlewares/multer';

const userRoute = express.Router();

userRoute.post(
  "/register",
  upload.fields([{ name: "profilePic", maxCount: 1 }]),
  register
);

userRoute.post(
  "/login",
  login
);


export default userRoute;