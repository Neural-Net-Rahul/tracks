"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verify = (req, res, next) => {
    const { token } = req.body;
    const obj = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
    if (!obj) {
        return res.status(413).json({ message: "Token is not verified" });
    }
    req.id = obj.id;
    next();
};
exports.default = verify;
