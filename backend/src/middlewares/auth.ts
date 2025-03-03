import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from 'jsonwebtoken'

interface AuthenticatedRequest extends Request {
    id : number
}

const verify:RequestHandler = (req : Request,res:Response ,next : NextFunction): any=> {
    const {token} = req.body;
    const obj = jwt.verify(token,process.env.TOKEN_SECRET!) as {id: number};
    if(!obj){
        return res.status(413).json({message:"Token is not verified"});
    }
    (req as AuthenticatedRequest).id = obj.id
    next();
}

export default verify