import nodemailer from 'nodemailer';
import { sendPasswordResetEmail, registerMail } from './emails';

export const sendResetPassEmail = (user, link) => {
	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: 'testingtanmay28@gmail.com', // generated ethereal user
			pass: 'ananye20' // generated ethereal password
		}
	});

	// setup email data with unicode symbols
	let mailOptions = {
		from: 'ahafiz167@gmail.com', // sender address
		to: [ user.email ], // list of receivers
		subject: 'Link To Reset Password', // Subject line
		//text: 'Hello world?', // plain text body
		html: sendPasswordResetEmail(user, link) // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
		console.log('Message sent: %s', info.messageId);
		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	});
};

export const sendRegistrationEmail = (user, link) => {
	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: 'testingtanmay28@gmail.com', // generated ethereal user
			pass: 'ananye20' // generated ethereal password
		}
	});

	// setup email data with unicode symbols
	let mailOptions = {
		from: 'ahafiz167@gmail.com', // sender address
		to: [ user.email ], // list of receivers
		subject: 'Register User', // Subject line
		//text: 'Hello world?', // plain text body
		html: registerMail(user, link) // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
		console.log('Message sent: %s', info.messageId);
		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	});
};
