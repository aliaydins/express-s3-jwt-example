import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../entity/User';

export const checkRole = (roles: Array<String>) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		const id = res.locals.jwtPayload.id;

		const userRepository = getRepository(User);
		let user: User;
		try {
			user = await userRepository.findOneOrFail(id);
		} catch (err) {
			return res.status(404).json({
				success: false,
				message: 'User not found ',
			});
		}

		if (roles.indexOf(user.role) > -1) {
			next();
		} else {
			return res.status(404).json({
				success: false,
				message: 'Hey,you! Stop right there. Authorization required',
			});
		}
	};
};
