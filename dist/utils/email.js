"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const transporter = nodemailer_1.default.createTransport({
    host: env_1.env.EMAIL_HOST,
    port: env_1.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: env_1.env.EMAIL_USER,
        pass: env_1.env.EMAIL_PASS,
    },
});
const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: env_1.env.EMAIL_USER,
            to,
            subject,
            html,
        });
    }
    catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map