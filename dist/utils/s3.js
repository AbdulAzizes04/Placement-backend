"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromS3 = exports.uploadToS3 = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const env_1 = require("../config/env");
aws_sdk_1.default.config.update({
    accessKeyId: env_1.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env_1.env.AWS_SECRET_ACCESS_KEY,
    region: env_1.env.AWS_REGION,
});
const s3 = new aws_sdk_1.default.S3();
const uploadToS3 = async (fileName, fileContent, contentType) => {
    const params = {
        Bucket: env_1.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: fileContent,
        ContentType: contentType,
    };
    try {
        const result = await s3.upload(params).promise();
        return result.Location;
    }
    catch (error) {
        console.error('S3 upload failed:', error);
        throw error;
    }
};
exports.uploadToS3 = uploadToS3;
const deleteFromS3 = async (fileName) => {
    const params = {
        Bucket: env_1.env.AWS_S3_BUCKET,
        Key: fileName,
    };
    try {
        await s3.deleteObject(params).promise();
    }
    catch (error) {
        console.error('S3 delete failed:', error);
        throw error;
    }
};
exports.deleteFromS3 = deleteFromS3;
//# sourceMappingURL=s3.js.map