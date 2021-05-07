import dotenv from 'dotenv';

dotenv.config();

export const DOMAIN = process.env.DOMAIN;
export const PORT = process.env.PORT;
export const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
export const BUCKET_REGION = process.env.AWS_BUCKET_REGION;
export const ACCESS_KEY = process.env.AWS_ACCESS_KEY;
export const SECRET_KEY = process.env.AWS_SECRET_KEY;
export const SECRET = process.env.SECRET;
export const SENDGRID_API = process.env.SENDGRID_API;
export const HOST_EMAIL = process.env.HOST_EMAIL;
