import path from 'path'
import {app} from "./app";
import dotenv from 'dotenv'

dotenv.config();

const PORT_NO = process.env.PORT_NO || 3001;

app.listen(PORT_NO,()=>{
    console.log(`Server is running on Port ${PORT_NO}`);
})
