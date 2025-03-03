"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const multer_1 = require("../middlewares/multer");
const auth_1 = __importDefault(require("../middlewares/auth"));
const userRoute = express_1.default.Router();
userRoute.post("/register", multer_1.upload.fields([{ name: "profilePic", maxCount: 1 }]), userController_1.register);
userRoute.post("/verify", userController_1.verifyUser);
userRoute.post("/login", userController_1.login);
userRoute.post("/create", auth_1.default, userController_1.createTrack);
exports.default = userRoute;
