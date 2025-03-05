import path from 'path'
import {app} from "./app";
import dotenv from 'dotenv'

dotenv.config();

// Serve static files from the 'build' directory
app.use(express.static(path.join(__dirname, 'build')));

// Catch-all route to handle client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT_NO = process.env.PORT_NO || 3001;

app.listen(PORT_NO,()=>{
    console.log(`Server is running on Port ${PORT_NO}`);
})
