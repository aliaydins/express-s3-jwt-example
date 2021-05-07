import { Router } from 'express';
import AuthController from '../controllers/AuthController';

const router = Router();

router.post('/signup', AuthController.signUp);

router.get('/verify-account/:verificationCode', AuthController.verifyAccount);

router.post('/login', AuthController.login);

router.post('/reset-password', AuthController.sendResetPasswordMail);

router.get('/reset-password/:resetPasswordToken', AuthController.resetPassword);

router.post('/reset-password-now', AuthController.resetPasswordNow);

export default router;
