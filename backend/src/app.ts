import path from 'path'
import express from 'express'
import cors from 'cors'
import userRoute from './routes/userRoute';
import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser'
import trackRoute from './routes/trackRoutes';

const app = express();
const client = new PrismaClient();

// Serve static files from the 'build' directory
app.use(express.static(path.join(__dirname, 'build')));

// Catch-all route to handle client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use(express.json());
app.use(cors({
    origin: 'https://rtracks.onrender.com',  // Allow only this origin
    credentials: true,  // Allow cookies if needed
}));
app.use(cookieParser());

app.use('/api/users',userRoute);
app.use("/api/tracks", trackRoute);

export {app, client}
