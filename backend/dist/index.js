"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT_NO = process.env.PORT_NO || 3001;
app_1.app.listen(PORT_NO, () => {
    console.log(`Server is running on Port ${PORT_NO}`);
});
