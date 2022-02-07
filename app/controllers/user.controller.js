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
	
	];
	secretKey = Constants.security.sessionSecret || 'i-am-the-secret-key-of-pario-web-backend-project';
	_populate = async (req, res, next) => {
		const { body: { email } } = req;
		try {
			const user = await User.findOne({ email });
			if (!user) {
				next();
				res.status(404).json({ msg: 'user is not exist!' });
			}

			req.user = user;
			next();
		} catch (err) {
			next(err);
		}
	};

	search = async (_req, res, next) => {
		try {
			// @TODO Add pagination
			res.json(await User.find());
		} catch (err) {
			next(err);
		}
	};

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
	      return res.status(200).json({ message: 'user already exists', success: 0 });
	    }
		let newUser = new User({
			...params,
			provider: 'local',
			password: await User.hashPassword(params.password, (password) => password)
		});
		try {
			const user = await newUser.save();
			const link = `http://localhost:3000/active`;
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
				res.status(200).json({ token: token, msg: "Registration email has been sent please verify!", success: true, user });
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
			return res.status(200).json({ message: Constants.messages.userNotFound, success: 0 });
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
			return res.status(200).json({ message: 'password updated', success: 1, user: updatedUser });
			
		} catch (err) {
			err.status = 400;
			next(err);
		}
	};

	
	delete = async (req, res, next) => {
		if (!req.currentUser) {
			return res.sendStatus(403);
		}

		try {
			await req.currentUser.remove();
			res.sendStatus(204);
		} catch (err) {
			next(err);
		}
	};



	login = async (req, res, next) => {
		const { email, password } = req.body;
		console.log(email, password);

		try {
			// See if user exist
			let user = await User.findOne({ email });
			console.log('user', user)
			if (!user) {
				return res.status(200).json({ msg: 'Invalid Credentials', sucess: false });
			}

			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return res.status(200).json({ msg: 'Invalid Credentials', sucess: false });
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
				res.status(200).json({ token, sucess: true, user });
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
				return res.status(404).json({ msg: 'User not Found!' });
			}
			const payload = { id: user._id };
			const token = jwt.sign(payload, this.secretKey, {
				expiresIn: '2m' // 2 minutes
			});
			const link = `http://localhost:3000/reset?userId=${user._id}`;
			await sendResetPassEmail(user, link);
			return res.status(200).json({ msg: 'Email Sent!', success: true });
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
				return res.status(404).json({ msg: 'User not Found!' });
			}
			const decode = jwt.verify(req.params.token, this.secretKey);
			if (!decode) {
				return res.status(400).json({ msg: 'Link Expired,Please Generate Again' });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);
			await user.save();

			return res.status(200).json({ msg: 'Password Changed Successfully!' });
		} catch (err) {
			if (err.message === 'jwt expired') {
				return res.status(400).json({ msg: 'Link Expired,Please Generate Again' });
			}
			err.status = 400;
			next(err);
		}
	};

	profileUser = async (req, res, next) => {
		try {
		const { id } = req.params;
		console.log(id);
		const user = await User.findById({ _id: id });
		if (user) {
			return res.status(200).json({ message: 'fetching done', user, success: 1 });
		}
		} catch (err) {
			err.status = 404;
			next(err)
	}
	}
	resetPassword = async (req, res, next) => {
		const { oldPassword, newPassword } = req.body;

		try {
			const user = await User.findById({ _id: req.user.id });
			if (!user) {
				return res.status(400).json({ msg: 'User Not Found!' });
			}
			const isMatch = await bcrypt.compare(oldPassword, user.password);
			if (isMatch) {
				const salt = await bcrypt.genSalt(10);
				const updateUserPassword = await User.findByIdAndUpdate(
					req.user.id,
					{
						$set: {
							password: await bcrypt.hash(newPassword, salt)
						}
					},
					{ new: true }
				);
				return res.status(200).json({ msg: 'Password Changed Successfully!' });
			}
			return res.status(400).json({ msg: 'Invalid Password' });
		} catch (err) {
			err.status = 400;
			next(err);
		}
	};
}

export default new UsersController();
