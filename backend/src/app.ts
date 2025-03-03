import express from 'express'
import cors from 'cors'
import userRoute from './routes/userRoute';
import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser'
import trackRoute from './routes/trackRoutes';

const app = express();
const client = new PrismaClient();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use('/api/users',userRoute);
app.use("/api/tracks", trackRoute);

export {app, client}
