import { NextFunction, Request, Response } from 'express';
import { getRepository, MoreThan } from 'typeorm';
import { User } from '../entity/User';
import { randomBytes } from 'crypto';
import sendMail from '../utils/email-sender';
import { join } from 'path';
import { DOMAIN, SECRET } from '../constants';

class AuthController {
	static signUp = async (req: Request, res: Response) => {
		const { username, email, password, role } = req.body;
		const userRepository = getRepository(User);

		try {
			let user = await userRepository.findOne({ where: { username } });
			if (user) {
				return res.status(400).json({ success: false, message: `User: ${username}  is already exist ` });
			}
			user = await userRepository.findOne({ where: { email } });
			if (user) {
				return res.status(400).json({
					success: false,
					message: `Email: ${email} is already registered. Did you forget the password. Try resetting it.`,
				});
			}

			try {
				const verificationCode = randomBytes(20).toString('hex');
				const newUser = new User(username, email, password, role, verificationCode);
				newUser.hashPassword();
				await userRepository.save(newUser);
				// Send the email to the user with a varification link

				let html = `
				 <div>
					 <h1>Hello, ${newUser.username}</h1>
					 <p>Please click the following link to verify your account</p>
					 <a href="${DOMAIN}auth/verify-account/${newUser.verificationCode}">Verify Now</a>
				 </div>
				 `;

				await sendMail(newUser.email, 'Verify Account', 'Please verify Your Account.', html);
				const userInfo = await newUser.getUserInfo();

				return res.status(201).json({
					success: true,
					user: userInfo,
					message: 'Your account is created please verify your email address.',
				});
			} catch (err) {
				return res.status(500).json({
					success: false,
					message: 'An error occurred. ****** ',
					err,
				});
			}
		} catch (err) {
			return res.status(500).json({
				success: false,
				message: 'An error occurred.',
				err,
			});
		}
	};

	static verifyAccount = async (req: Request, res: Response) => {
		const verificationCode = req.params.verificationCode;
		const userRepository = getRepository(User);
		try {
			let user = await userRepository.findOne({ where: { verificationCode } });
			if (!user) {
				return res.status(401).json({
					success: false,
					message: 'Unauthorized access. Invalid verification code.',
				});
			}
			user.verified = true;
			user.verificationCode = null;
			await userRepository.save(user);

			return res.sendFile(join(__dirname, '../templates/verify-success.html'));
		} catch (err) {
			console.log('ERR', err.message);
			return res.sendFile(join(__dirname, '../templates/errors.html'));
		}
	};

	static login = async (req: Request, res: Response) => {
		const { email, password } = req.body;
		const userRepository = getRepository(User);

		try {
			const user: User = await userRepository.findOneOrFail({ where: { email } });
			if (!user) {
				return res.status(404).json({
					success: false,
					message: `User not found.${email} is invalid`,
				});
			}
			if (!user.verified) {
				return res.status(404).json({
					success: false,
					message: 'Your account is created before but not verified please verify your email address.',
				});
			}

			if (!user.checkIfPasswordMatch(password)) {
				return res.status(401).json({
					success: false,
					message: 'Incorrect password.',
				});
			}

			const token = await user.generateJWT();
			const userInfo = await user.getUserInfo();

			return res.status(200).json({
				success: true,
				user: userInfo,
				token: `Bearer ${token}`,
				message: 'You are  logged in.',
			});
		} catch (err) {
			return res.status(500).json({
				sucess: false,
				message: 'Something went wrong.',
				error: err,
			});
		}
	};

	static sendResetPasswordMail = async (req: Request, res: Response) => {
		try {
			const { email } = req.body;
			const userRepository = getRepository(User);
			const user = await userRepository.findOne({ where: { email } });
			if (!user) {
				return res.status(404).json({
					success: false,
					message: `User with the ${email} is not found`,
				});
			}
			if (!user.verified) {
				return res.status(404).json({
					success: false,
					message: 'Your account is created before but not verified please verify your email address.',
				});
			}

			user.generatePasswordReset();
			userRepository.save(user);

			let html = `
			<div>
				<h1>Hello, ${user.username}</h1>
				<p>Please click the following link to reset your password.</p>
				<p>If this password reset request is not created by your then you can ignore this email.</p>
				<a href="${DOMAIN}auth/reset-password/${user.resetPasswordToken}">Reset Password</a>
			</div>
		  `;
			await sendMail(user.email, 'Reset Password', 'Please reset your password.', html);
			return res.status(404).json({
				success: true,
				message: 'Password reset link is sent your email.',
			});
		} catch (err) {
			return res.status(500).json({
				sucess: false,
				message: 'Something went wrong.',
				error: err,
			});
		}
	};

	static resetPassword = async (req: Request, res: Response) => {
		try {
			const resetPasswordToken = req.params.resetPasswordToken;
			const userRepository = getRepository(User);
			const user = await userRepository.findOne({
				where: { resetPasswordToken, resetPasswordExpires: MoreThan(`${Date.now()}`) },
			});
			if (!user) {
				return res.status(401).json({
					success: false,
					message: 'Password reset token is invalid or has expired. Please try again',
				});
			}
			return res.sendFile(join(__dirname, '../templates/password-reset.html'));
		} catch (err) {
			return res.sendFile(join(__dirname, '../templates/errors.html'));
		}
	};

	static resetPasswordNow = async (req: Request, res: Response) => {
		try {
			const { resetPasswordToken, password } = req.body;

			const userRepository = getRepository(User);
			let user = await userRepository.findOne({
				where: { resetPasswordToken, resetPasswordExpires: MoreThan(`${Date.now()}`) },
			});

			if (!user) {
				return res.status(401).json({
					success: false,
					message:
						'Password reset token is invalid or has expired. Please go back to the reset password page and try again ',
				});
			}
			user.password = password;
			user.resetPasswordToken = null;
			user.resetPasswordExpires = null;
			user.hashPassword();
			await userRepository.save(user);

			let html = `
          			<div>
             			 <h1>Hello, ${user.username}</h1>
             			 <p>Your password is resetted successfully.</p>
             			 <p>If this rest is not done by you then you can contact our team.</p>
					</div>`;

			await sendMail(user.email, 'Reset Password Successful', 'Your password is changed.', html);
			return res.status(200).json({
				success: true,
				message:
					'Your password reset request is complete and your password is resetted successfully. Login into your account with your new password.',
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

export default AuthController;
