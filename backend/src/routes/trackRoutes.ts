import express from "express";
import verify from "../middlewares/auth";
import {createPage, deletePage, deleteTrack, nextPage, saveTrack, trackData} from "../controllers/trackController";

const trackRoute = express.Router();

trackRoute.post("/trackData", verify, trackData);
trackRoute.post("/saveTrack", verify, saveTrack);
trackRoute.post("/createPage", verify, createPage);
trackRoute.post("/deleteTrack", verify, deleteTrack);
trackRoute.post("/nextPage", verify, nextPage);
trackRoute.post("/deletePage", verify, deletePage);

export default trackRoute;
