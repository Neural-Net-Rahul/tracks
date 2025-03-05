import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from 'jsonwebtoken'

interface AuthenticatedRequest extends Request {
    id : number
}

const verify:RequestHandler = (req : Request,res:Response ,next : NextFunction): any=> {
    if(req.headers.authorization){
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
          return res.status(400).json({ message: "Token is missing" });
        }
        const obj = jwt.verify(token, process.env.TOKEN_SECRET!) as {
          id: number;
        };
        if (!obj) {
          return res.status(413).json({ message: "Token is not verified" });
        }
        (req as AuthenticatedRequest).id = obj.id;
        next();
    }
    else{
        const {token} = req.body;
        if(!token){
            return res.status(400).json({ message: "Token is missing" });
        }
        const obj = jwt.verify(token,process.env.TOKEN_SECRET!) as {id: number};
        if(!obj){
            return res.status(413).json({message:"Token is not verified"});
        }
        (req as AuthenticatedRequest).id = obj.id
        next();
    }
}

export default verify