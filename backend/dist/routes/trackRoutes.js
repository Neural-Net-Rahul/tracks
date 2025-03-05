"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const trackController_1 = require("../controllers/trackController");
const multer_1 = require("../middlewares/multer");
const trackRoute = express_1.default.Router();
trackRoute.post("/trackData", auth_1.default, trackController_1.trackData);
trackRoute.post("/saveTrack", auth_1.default, multer_1.upload.fields([
    { name: "image", maxCount: 1 }
]), trackController_1.saveTrack);
trackRoute.post("/createPage", auth_1.default, trackController_1.createPage);
trackRoute.post("/deleteTrack", auth_1.default, trackController_1.deleteTrack);
trackRoute.post("/nextPage", auth_1.default, trackController_1.nextPage);
trackRoute.post("/deletePage", auth_1.default, trackController_1.deletePage);
trackRoute.post("/pageData", auth_1.default, trackController_1.sentPageData);
trackRoute.post("/tokenWatchPage", auth_1.default, trackController_1.tokenWatchPage);
trackRoute.post("/getEditorApiKey", auth_1.default, trackController_1.getEditorApiKey);
trackRoute.post("/prevPage", auth_1.default, trackController_1.prevPage);
trackRoute.post("/savePage", auth_1.default, trackController_1.savePage);
trackRoute.post("/noTokenWatch", trackController_1.noTokenWatch);
trackRoute.post("/noTokenWatchTrack", trackController_1.noTokenWatchTrack);
trackRoute.post("/tokenWatchTrack", auth_1.default, trackController_1.tokenWatchTrack);
trackRoute.get("/getAllTracks", trackController_1.getAllTracks);
exports.default = trackRoute;
