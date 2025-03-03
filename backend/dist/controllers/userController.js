"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrack = exports.verifyUser = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const app_1 = require("../app");
const cloudinary_1 = require("../utils/cloudinary");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (id) => {
    const token = jsonwebtoken_1.default.sign({ id }, process.env.TOKEN_SECRET);
    return token;
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ msg: "Name, email and password are compulsory fields" });
            return;
        }
        const user = yield app_1.client.user.findFirst({ where: { email } });
        if (user) {
            res.status(409).json({ message: "User already exists" });
            return;
        }
        const profilePath = ((_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a.profilePic) === null || _b === void 0 ? void 0 : _b[0].path) || "";
        let profileCloudinaryUrl = '';
        if (profilePath) {
            const profile = yield (0, cloudinary_1.uploadOnCloudinary)(profilePath);
            profileCloudinaryUrl = (profile === null || profile === void 0 ? void 0 : profile.url) || "";
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = yield app_1.client.user.create({
            data: {
                name, email, password: hashedPassword, profilePhoto: profileCloudinaryUrl
            }
        });
        const id = newUser.id;
        const token = generateToken(id);
        res.status(200).json({ message: "User created successfully", token });
        return;
    }
    catch (e) {
        res.status(401).json({ message: "Something went wrong" });
        return;
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Email and Password are compulsory" });
            return;
        }
        const user = yield app_1.client.user.findFirst({ where: { email } });
        if (!user) {
            res.status(404).json({ message: "User does not exist" });
            return;
        }
        const dbPassword = user.password;
        const isSame = yield bcryptjs_1.default.compare(password, dbPassword);
        if (!isSame) {
            res.status(400).json({ message: "Incorrect password" });
            return;
        }
        const token = generateToken(user.id);
        res.status(200).json({ message: "Logged in successfully", token });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.login = login;
const verifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, token } = req.body;
        const obj = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
        if (!obj) {
            res.status(500).json({ message: "User is not verified" });
            return;
        }
        if (obj.id != id) {
            res.status(500).json({ message: "User is not verified" });
            return;
        }
        res.status(200).json({ message: "Verified User" });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "User is not verified" });
        return;
    }
});
exports.verifyUser = verifyUser;
const createTrack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const track = yield app_1.client.track.create({
            data: {
                user: {
                    connect: { id: req.id },
                },
            },
        });
        res.status(200).json({ message: "Track Created", trackId: track.id });
    }
    catch (e) {
        res.status(500).json({ message: "Problem in creating track" });
        return;
    }
});
exports.createTrack = createTrack;
