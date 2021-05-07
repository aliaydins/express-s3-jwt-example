import S3 from 'aws-sdk/clients/s3';
import { ACCESS_KEY, SECRET_KEY, BUCKET_NAME, BUCKET_REGION } from '../constants';

const fs = require('fs');

const s3 = new S3({
	accessKeyId: ACCESS_KEY,
	secretAccessKey: SECRET_KEY,
	region: BUCKET_REGION,
});

export const uploadFile = (file: any) => {
	const fileStream = fs.createReadStream(file.path);

	const uploadParams = {
		Bucket: BUCKET_NAME,
		Body: fileStream,
		Key: file.filename,
	};

	return s3.upload(uploadParams).promise();
};

export const getFileStream = (fileKey: any) => {
	const downloadParams = {
		Key: fileKey,
		Bucket: BUCKET_NAME,
	};

	return s3.getObject(downloadParams).createReadStream();
};
