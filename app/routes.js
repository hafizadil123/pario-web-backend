import { Router } from 'express';
import UsersController from './controllers/user.controller';
import CardsController from './controllers/cardController'
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

//card

routes.post('/api/cards', authenticate, CardsController.create);
routes.get('/api/cards', authenticate, CardsController.findAll);
routes.put('/api/cards/:id', authenticate, CardsController.update);
routes.get('/api/cards/:id', authenticate, CardsController.findOne);
routes.delete('/api/cards/:id',authenticate, CardsController.delete);


routes.use(errorHandler);

export default routes;
