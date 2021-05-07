import { Router } from 'express';
import { checkJwt } from '../middlewares/checkJwt';
import { checkRole } from '../middlewares/checkRole';
import UserController from '../controllers/UserController';
import multer from 'multer';

const router = Router();

router.get('/', [checkJwt, checkRole(['ADMIN'])], UserController.getAllUser);

router.get('/:id([0-9]+)', [checkJwt, checkRole(['ADMIN'])], UserController.getUserById);

router.get('/image/:key', UserController.getUserPhoto);

router.put(
	'/',
	[checkJwt, checkRole(['ADMIN', 'USER'])],
	multer({ dest: './src/img/' }).single('image'),
	UserController.editUser,
);

router.delete('/:id([0-9]+)', [checkJwt, checkRole(['ADMIN', 'USER'])], UserController.deleteUser);

export default router;
