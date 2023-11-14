import {
  getAllUsers,
  createUser,
  loginUser,
  validateUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';

import checkToken from '../middleware/checkToken.js';

export default function (fastify, opts, done) {
  // Get all users
  fastify.get('/users', { preHandler: checkToken }, getAllUsers);

  // Create a user
  fastify.post('/users/create', { preHandler: checkToken }, createUser);

  // login user
  fastify.post('/users/login', loginUser);

  // validate token
  fastify.get('/users/validate', { preHandler: checkToken }, validateUser);

  // Update a user
  fastify.put('/users/:id', { preHandler: checkToken }, updateUser);

  // Delete a user
  fastify.delete('/users/:id', { preHandler: checkToken }, deleteUser);

  done();
}
