import { Router } from 'express';
import UsersController from './controllers/user.controller';
import authenticate from './middleware/authenticate';
import accessControl from './middleware/access-control';
import errorHandler from './middleware/error-handler';
const routes = new Router();

// Users
routes.post('/api/users/register', UsersController.create);
routes.post('/api/users/login', UsersController.login);
routes.post('/api/users/resetPassword', UsersController.resetPassword);
routes.post('/api/users/sendforgetPasswordEmail', UsersController.sendForgetPassEmail);
routes.post('/api/users/forgetPassword/:userId/:token', UsersController.forgetPassword);
routes.put('/api/users/updatePassword', UsersController.update);
routes.get('/api/users/user/:id', UsersController.profileUser);



routes.use(errorHandler);

export default routes;
