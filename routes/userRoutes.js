import {
  getAllUsers,
  createUser,
  loginUser,
  validateUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';

export default function (fastify, opts, done) {
  // Get all users
  fastify.get('/users', getAllUsers);

  // Create a user
  fastify.post('/users/create', createUser);

  // login user
  fastify.post('/users/login', loginUser);

  // validate token
  fastify.get('/users/validate', validateUser);

  // Update a user
  fastify.put('/users/:id', updateUser);

  // Delete a user
  fastify.delete('/users/:id', deleteUser);

  done();
}
