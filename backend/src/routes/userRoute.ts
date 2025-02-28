import express from 'express'
import { register } from '../controllers/userController';
import { upload } from '../middlewares/multer';

const userRoute = express.Router();

userRoute.post(
  "/register",
  upload.fields([{ name: "profilePic", maxCount: 1 }]),
  register
);


export default userRoute;