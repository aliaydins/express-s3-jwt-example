import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SECRET } from '../constants';

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
	console.log(req.body);
	const token = req.get('Authorization');
	let jwtPayload;

	if (!token) {
		return res.status(401).json('Authorization header not provided');
	}

	try {
		jwtPayload = <any>jwt.verify(token, SECRET);
		res.locals.jwtPayload = jwtPayload;
	} catch (err) {
		res.status(401).json({ success: false, message: 'Invalid Token' });
		return;
	}

	const { id, role, username } = jwtPayload;

	const newToken = jwt.sign({ id, role, username }, SECRET, {
		expiresIn: '1h',
	});

	res.setHeader('token', `Bearer ${newToken}`);

	next();
};
