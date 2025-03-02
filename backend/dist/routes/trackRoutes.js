"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const trackController_1 = require("../controllers/trackController");
const trackRoute = express_1.default.Router();
trackRoute.post("/trackData", auth_1.default, trackController_1.trackData);
trackRoute.post("/saveTrack", auth_1.default, trackController_1.saveTrack);
trackRoute.post("/createPage", auth_1.default, trackController_1.createPage);
trackRoute.post("/deleteTrack", auth_1.default, trackController_1.deleteTrack);
trackRoute.post("/nextPage", auth_1.default, trackController_1.nextPage);
trackRoute.post("/deletePage", auth_1.default, trackController_1.deletePage);
exports.default = trackRoute;
