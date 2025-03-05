import express from "express";
import verify from "../middlewares/auth";
import {changeTrackStatus, createPage, deletePage, deleteTrack, getAllTracks, getEditorApiKey, nextPage, noTokenWatch, noTokenWatchTrack, prevPage, savePage, saveTrack, sentPageData, tokenWatchPage, tokenWatchTrack, trackData} from "../controllers/trackController";
import { upload } from "../middlewares/multer";
const trackRoute = express.Router();

trackRoute.post("/trackData", verify, trackData);
trackRoute.post("/saveTrack",verify,upload.fields([
    {name:"image", maxCount:1}
]), saveTrack);
trackRoute.post("/createPage", verify, createPage);
trackRoute.post("/deleteTrack", verify, deleteTrack);
trackRoute.post("/nextPage", verify, nextPage);
trackRoute.post("/deletePage", verify, deletePage);
trackRoute.post("/pageData", verify, sentPageData);
trackRoute.post("/tokenWatchPage", verify, tokenWatchPage);
trackRoute.post("/getEditorApiKey", verify, getEditorApiKey);
trackRoute.post("/prevPage", verify, prevPage);
trackRoute.post("/savePage", verify, savePage);
trackRoute.post("/noTokenWatch", noTokenWatch);
trackRoute.post("/noTokenWatchTrack", noTokenWatchTrack);
trackRoute.post("/tokenWatchTrack",verify, tokenWatchTrack);
trackRoute.get("/getAllTracks", getAllTracks);
trackRoute.post("/changeTrackStatus", verify, changeTrackStatus);

export default trackRoute;
