import 'reflect-metadata';
import { createConnection } from 'typeorm';
import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/', routes);

createConnection()
	.then(async (connection) => {
		app.listen(5000, () => {
			console.log('Server started on port 5000!');
		});
	})
	.catch((error) => console.log(error));
