import express from "express";
import verify from "../middlewares/auth";
import {createPage, deletePage, deleteTrack, getEditorApiKey, nextPage, noTokenWatch, prevPage, savePage, saveTrack, sentPageData, tokenWatchPage, trackData} from "../controllers/trackController";

const trackRoute = express.Router();

trackRoute.post("/trackData", verify, trackData);
trackRoute.post("/saveTrack", verify, saveTrack);
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

export default trackRoute;
