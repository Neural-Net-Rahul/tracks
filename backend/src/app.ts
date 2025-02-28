import express from 'express'
import cors from 'cors'
import userRoute from './routes/userRoute';
import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser'

const app = express();
const client = new PrismaClient();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use('/api/users',userRoute);

export {app, client}
