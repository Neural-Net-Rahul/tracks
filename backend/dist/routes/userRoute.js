"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const multer_1 = require("../middlewares/multer");
const userRoute = express_1.default.Router();
userRoute.post("/register", multer_1.upload.fields([{ name: "profilePic", maxCount: 1 }]), userController_1.register);
exports.default = userRoute;
