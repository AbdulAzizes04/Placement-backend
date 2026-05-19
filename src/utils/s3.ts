import AWS from 'aws-sdk';
import { env } from '../config/env';

AWS.config.update({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.AWS_REGION,
});

const s3 = new AWS.S3();

export const uploadToS3 = async (fileName: string, fileContent: Buffer, contentType: string) => {
  const params = {
    Bucket: env.AWS_S3_BUCKET,
    Key: fileName,
    Body: fileContent,
    ContentType: contentType,
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('S3 upload failed:', error);
    throw error;
  }
};

export const deleteFromS3 = async (fileName: string) => {
  const params = {
    Bucket: env.AWS_S3_BUCKET,
    Key: fileName,
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('S3 delete failed:', error);
    throw error;
  }
};