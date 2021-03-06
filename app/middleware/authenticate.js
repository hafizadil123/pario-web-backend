import jwt from 'jsonwebtoken';

export default function authenticate(req, res, next) {
	// Get token from the header
	const token = req.header('accessToken');

	// Check if no token
	if (!token) {
		return res.status(401).json({ msg: 'No token, authorization denied' });
	}
	// verify token
	try {
		const decoded = jwt.verify(token, 'i-am-the-secret-key-of-pario-web-backend-project');
		req.user = decoded.user;
		next();
	} catch (err) {
		return res.status(401).json({ msg: 'Token is no valid' });
	}
}
