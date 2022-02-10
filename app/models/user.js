import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const Schema = mongoose.Schema;

const userSchema = new Schema({
	firstName: {
		type: String,
		required: [ true, 'First name is required' ]
	},
	lastName: {
		type: String,
		required: [ true, 'Last name is required' ]
	},
	email: {
		type: String,
		trim: true,
		lowercase: true,
		required: [ true, 'Email is required' ]
	},
	provider: {
		type: String,
		default: 'web'
	},
	password: {
		type: String,
		required: [ true, 'Password is required' ]
	},
	isActive: {
		type: Boolean,
		default: false
	},
	role: {
		type: String,
		enum: [ 'admin', 'user'],
		default: 'user'
	},
	createdAt: {
		type: Date,
		default: new Date()
	}
});

userSchema.static('hashPassword', async function(password, cb) { 
	const salt = await bcrypt.genSalt(10);
	const hash = await bcrypt.hash(password, salt);
	return cb(hash)
 });
 const User = mongoose.model('user', userSchema);
export default User;
