import { NextFunction, Request, Response, Router } from 'express';
import auth from './auth';
import user from './user';
const routes = Router();

routes.get('', (req, res) => {
	res.status(200).header('Content-Type', 'text/html').send(`<h4>Express S3 Typeorm PostgreSQL - Redis Rest Api</h4>`);
});
routes.use('/auth', auth);
routes.use('/user', user);

export default routes;
