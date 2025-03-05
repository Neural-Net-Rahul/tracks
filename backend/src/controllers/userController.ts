import { Request,Response } from "express";
import { RequestHandler } from "express";
import bcrypt from 'bcryptjs'
import { client } from "../app";
import { uploadOnCloudinary } from "../utils/cloudinary";
import jwt from 'jsonwebtoken'

const generateToken = (id:number) => {
    const token = jwt.sign({id},process.env.TOKEN_SECRET!);
    return token;
}

interface AuthenticatedRequest extends Request {
  id: number;
}

const register : RequestHandler = async (req: Request, res: Response) : Promise<void> => {
    try{
        const {name, email, password} = req.body;
        if(!name || !email || !password){
            res.status(400).json({msg:"Name, email and password are compulsory fields"});
            return;
        }
        const user = await client.user.findFirst({where:{email}});
        if(user){   
            res.status(409).json({message:"User already exists"});
            return;
        }
        const profilePath = (req.files as { [fieldname: string]: Express.Multer.File[] })?.profilePic?.[0].path || "";
        let profileCloudinaryUrl = ''; 
        if(profilePath){
            const profile = await uploadOnCloudinary(profilePath);
            profileCloudinaryUrl = profile?.url || "";
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = await client.user.create({
            data: {
                name, email, password : hashedPassword, profilePhoto: profileCloudinaryUrl
            }
        })
        const id = newUser.id;
        const token = generateToken(id);
        res.status(200).json({message:"User created successfully", token});
        return;
    }catch(e){
        res.status(401).json({message:"Something went wrong"})
        return;
    }
}

const login: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and Password are compulsory" });
      return;
    }

    const user = await client.user.findFirst({ where: { email } });
    if (!user) {
      res.status(404).json({ message: "User does not exist" });
      return;
    }

    const dbPassword = user.password;
    const isSame = await bcrypt.compare(password, dbPassword);

    if (!isSame) {
      res.status(400).json({ message: "Incorrect password" });
      return;
    }

    const token = generateToken(user.id);
    res.status(200).json({ message: "Logged in successfully", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const verifyUser:RequestHandler = async(req:Request,res:Response):Promise<void> =>{
  try{
    const {id, token} = req.body;
    const obj : any = jwt.verify(token,process.env.TOKEN_SECRET!);
    if(!obj){
      res.status(500).json({ message: "User is not verified" });
      return;
    }
    if(obj.id != id){
      res.status(500).json({ message: "User is not verified" });
      return;
    }
    res.status(200).json({message:"Verified User"});
    return;
  }
  catch(e){
    res.status(500).json({message:"User is not verified"});
    return;
  }
}

const createTrack:RequestHandler = async (req:Request,res:Response): Promise<void> => {
  try{
    const track = await client.track.create({
      data: {
        user: {
          connect: { id: (req as AuthenticatedRequest).id },
        },
      },
    });
    res.status(200).json({message:"Track Created",trackId:track.id});
  }
  catch(e){
    res.status(500).json({message:"Problem in creating track"});
    return;
  }
}

const getUserData: RequestHandler = async (req:Request,res:Response):Promise<void> => {
  try{
    const userData = await client.user.findFirst({
      where:{
        id: (req as AuthenticatedRequest).id
      },
      include:{
        tracks:true
      }
    })
    res.status(200).json({message:"Sending user data",userData});
    return;
  }
  catch(e){
    res.status(500).json({message:"Error while sending user data"});
    return;
  }
}

const uploadImage:RequestHandler = async(req:Request,res:Response):Promise<void> => {
  try{
    const filePath = (req.files as { [fieldname: string]: Express.Multer.File[] })?.image?.[0].path;
    const file = await uploadOnCloudinary(filePath);
    res.status(200).json({message:"Image uploaded",url:file?.url});
    return;
  }
  catch(e){
    res.status(500).json({message:"Error while uploading image"});
    return;
  }
}


export {register, login, verifyUser, createTrack, getUserData, uploadImage};