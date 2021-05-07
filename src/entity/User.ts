import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SECRET } from '../constants';
import { randomBytes } from 'crypto';

@Entity('user')
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	username: string;

	@Column({
		unique: true,
	})
	email: string;

	@Column()
	password: string;

	@Column({
		type: 'enum',
		enum: ['USER', 'ADMIN'],
		default: 'USER',
	})
	role: string;

	@Column({ nullable: true })
	photo: string;

	@Column({
		default: false,
	})
	verified: boolean;

	@Column({
		default: null,
	})
	verificationCode: string;

	@Column({ nullable: true })
	resetPasswordToken: string;

	@Column({ nullable: true })
	resetPasswordExpires: string;

	@Column()
	@CreateDateColumn()
	createdAt: Date;

	@Column()
	@UpdateDateColumn()
	updatedAt: Date;

	constructor(username: string, email: string, password: string, role: string | null, verificationCode: string | null) {
		super();
		(this.username = username), (this.email = email);
		(this.password = password), (this.role = role);
		this.verificationCode = verificationCode;
	}

	hashPassword() {
		this.password = bcrypt.hashSync(this.password, 10);
	}

	generateJWT() {
		let payload = {
			id: this.id,
			username: this.username,
			email: this.email,
			role: this.role,
		};
		return jwt.sign(payload, SECRET, { expiresIn: '1 day' });
	}

	getUserInfo() {
		const user = {
			id: this.id,
			username: this.username,
			email: this.email,
			role: this.role,
			verified: this.verified,
		};
		return user;
	}

	generatePasswordReset = function () {
		this.resetPasswordExpires = Date.now() + 36000000; // One Hour
		console.log('resetPasswordExpress', this.resetPasswordExpires);
		this.resetPasswordToken = randomBytes(20).toString('hex');
	};

	checkIfPasswordMatch(unencryptedPassword: string) {
		return bcrypt.compareSync(unencryptedPassword, this.password);
	}
}
