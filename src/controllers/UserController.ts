import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { DOMAIN } from '../constants';
import { User } from '../entity/User';
import { uploadFile, getFileStream } from '../utils/aws';

class UserController {
	static getUserPhoto = async (req: Request, res: Response) => {
		const key = req.params.key;

		const readStream = getFileStream(key);

		readStream.pipe(res);
	};

	static getUserById = async (req: Request, res: Response) => {
		const id = req.params.id;
		const userRepository = getRepository(User);

		try {
			const user = await userRepository.findOne({ where: { id } });
			if (!user) {
				return res.status(404).json({
					success: false,
					message: `User not found. ${id} is invalid`,
				});
			}

			return res.status(200).json({
				success: true,
				user: user,
			});
		} catch (err) {
			return res.status(500).json({
				sucess: false,
				message: 'Something went wrong.',
				error: err,
			});
		}
	};

	static getAllUser = async (req: Request, res: Response) => {
		const userRepository = getRepository(User);

		try {
			const users = await userRepository.find({
				select: ['id', 'username', 'email', 'role', 'verified', 'updatedAt', 'createdAt'],
			});
			if (!users) {
				return res.status(404).json({
					success: false,
					message: 'Users not found ',
				});
			}
			return res.status(200).json({
				success: true,
				user: users,
			});
		} catch (err) {
			return res.status(500).json({
				sucess: false,
				message: 'Something went wrong.',
				error: err,
			});
		}
	};

	static editUser = async (req: Request, res: Response) => {
		let file = req.file;
		const id = res.locals.jwtPayload.id;
		const userRepository = getRepository(User);
		const { username, email, role, photo } = req.body;
		let photoPath;

		if (file) {
			console.log('hellooooo', file);
		}
		try {
			if (file === undefined) {
				photoPath = null;
			} else {
				photoPath = `${DOMAIN}/user/image/${file.filename}`;
				const result = await uploadFile(file);
				if (!result) {
					return res.status(404).json({
						success: false,
						message: `Image could not be uploaded`,
					});
				}
			}

			let user = await userRepository.findOne({ where: { id } });
			if (!user) {
				return res.status(404).json({
					success: false,
					message: `User  not found with ${id}`,
				});
			}

			user.username = username || user.username;
			user.email = email || user.email;
			user.role = role || user.email;
			user.photo = photoPath;

			await userRepository.save(user);

			return res.status(200).json({
				success: true,
				user: user,
				message: 'User successfully  updated',
			});
		} catch (err) {
			return res.status(500).json({
				sucess: false,
				message: 'Something went wrong.',
				error: err,
			});
		}
	};

	static deleteUser = async (req: Request, res: Response) => {
		const id = req.params.id;
		const currentUserId = res.locals.jwtPayload.id;
		const role = res.locals.jwtPayload.role;
		const userRepository = getRepository(User);

		try {
			if (role !== 'ADMIN' && id !== currentUserId) {
				return res.status(401).json({
					success: false,
					message: 'You are not user owner, You can not make changes',
				});
			}

			const user = await userRepository.findOne({ where: { id } });

			if (!user) {
				return res.status(404).json({
					success: false,
					message: `User not found with ${id}`,
				});
			}

			await userRepository.remove(user);
			return res.status(200).json({
				success: true,
				message: 'User successfully  deleted',
			});
		} catch (err) {
			return res.status(500).json({
				sucess: false,
				message: 'Something went wrong.',
				error: err,
			});
		}
	};
}

export default UserController;
