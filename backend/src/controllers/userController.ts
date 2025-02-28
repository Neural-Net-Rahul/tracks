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

export {register};