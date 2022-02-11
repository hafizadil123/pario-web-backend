import BaseController from './base.controller';
import User from '../models/user';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendResetPassEmail, sendRegistrationEmail } from '../lib/util';
import Constants from '../config/constants';

class UsersController extends BaseController {
	whitelist = [
		'firstName',
		'email',
		'password',
		'lastName',
		'provider'
	];
	secretKey = Constants.security.sessionSecret || 'i-am-the-secret-key-of-pario-web-backend-project';
	links = {
		registerLink: 'http://localhost:3000/active'
	}
	fetch = (req, res) => {
		const user = req.user || req.currentUser;

		if (!user) {
			return res.sendStatus(404);
		}

		res.json(user);
	};

	create = async (req, res, next) => {
		const params = this.filterParams(req.body, this.whitelist);
		let user = await User.findOne({ email: params.email });
		if (user) {
			return res.status(200).json({ message: 'User already exists', success: false, user });
		}
		let newUser = new User({
			...params,
			provider: 'local',
			password: await User.hashPassword(params.password, (password) => password)
		});
		try {
			const user = await newUser.save();
			const link = this.links.registerLink;
			sendRegistrationEmail(user, link);
			const payload = {
				user: {
					id: user.id,
					email: user.email,
					role: user.role
				}
			};
			jwt.sign(payload, this.secretKey, { expiresIn: '1h' }, (err, token) => {
				if (err) throw err;
				res.status(200).json({ token: token, message: "Registration email has been sent please verify!", success: true, user });
			});
		} catch (err) {
			err.status = 400;
			next(err);
		}
	};

	update = async (req, res, next) => {
		const { password, userId } = req.body;

		try {
			const user = await User.findById({ _id: userId });
			if (!user) {
				return res.status(200).json({ message: Constants.messages.userNotFound, success: false });
			}

			const salt = await bcrypt.genSalt(10);
			const updatedUser = await User.findByIdAndUpdate(
				userId,
				{
					$set: {
						password: await bcrypt.hash(password, salt),
					},
				},
				{ new: true },
			).select('-password');
			return res.status(200).json({ message: 'password has been updated, please wait we are redirecting to login page...', success: true, user: updatedUser });

		} catch (err) {
			err.status = 400;
			next(err);
		}
	};

	login = async (req, res, next) => {
		const { email, password, provider = 'web' } = req.body;
		console.log(email, password);

		try {
			// See if user exist
			let user = await User.findOne({ email });
			console.log('user', user)
			if (!user) {
				return res.status(200).json({ message: 'Invalid Credentials', success: false });
			}
			if (provider === 'google') {
				const isGoogleUser = await User.findOne({ email });

				const payload = {
					user: {
						id: isGoogleUser.id,
						email: isGoogleUser.email,
						role: isGoogleUser.role
					}
				};
				if (isGoogleUser) {
					jwt.sign(payload, this.secretKey, { expiresIn: '1h' }, (err, token) => {
						if (err) throw err;
						res.status(200).json({ token, success: true, user: isGoogleUser });
					});

				}
			}
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return res.status(200).json({ message: 'Invalid Credentials', success: false });
			}

			// Return jsonwebtoken
			const payload = {
				user: {
					id: user.id,
					email: user.email,
					role: user.role
				}
			};
			jwt.sign(payload, this.secretKey, { expiresIn: '1h' }, (err, token) => {
				if (err) throw err;
				res.status(200).json({ token, success: true, user });
			});
		} catch (error) {
			err.status = 400;
			next(err);
		}
	};

	sendForgetPassEmail = async (req, res, next) => {
		const { email } = req.body;
		try {
			const user = await User.findOne({ email: email }).select('firstName lastName email');
			if (!user) {
				return res.status(404).json({ message: 'User not Found!' });
			}
			const payload = { id: user._id };
			const token = jwt.sign(payload, this.secretKey, {
				expiresIn: '2m' // 2 minutes
			});
			const link = `http://localhost:3000/updatePassword?userId=${user._id}`;
			await sendResetPassEmail(user, link);
			return res.status(200).json({ message: 'Your forgot password email has been sent to your mailbox! please verify to proceed', success: true });
		} catch (err) {
			err.status = 400;
			next(err);
		}
	};

	forgetPassword = async (req, res, next) => {
		const { password } = req.body;
		try {
			const user = await User.findOne({ _id: req.params.userId }).select('password');
			if (!user) {
				return res.status(404).json({ message: 'User not Found!' });
			}
			const decode = jwt.verify(req.params.token, this.secretKey);
			if (!decode) {
				return res.status(400).json({ message: 'Link Expired,Please Generate Again' });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);
			await user.save();

			return res.status(200).json({ message: 'Password Changed Successfully!' });
		} catch (err) {
			if (err.message === 'jwt expired') {
				return res.status(400).json({ message: 'Link Expired,Please Generate Again' });
			}
			err.status = 400;
			next(err);
		}
	};

}

export default new UsersController();
