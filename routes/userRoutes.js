import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';

export default function (fastify, opts, done) {
  fastify.addHook('preHandler', (request, reply, done) => {
    if (!request.session.authenticated) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    } else {
      done();
    }
  });

  // Get all users
  fastify.get('/users', getAllUsers);

  // Create a user
  fastify.post('/users/create', createUser);

  // Update a user
  fastify.put('/users/:id', updateUser);

  // Delete a user
  fastify.delete('/users/:id', deleteUser);

  done();
}
