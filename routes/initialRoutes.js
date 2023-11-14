import {
  initialCheck,
  initialRegistration,
  loginUser,
} from '../controllers/initialController.js';

export default function (fastify, opts, done) {
  fastify.get('/initial', initialCheck);

  // First user creation
  fastify.post('/initial/genesis', initialRegistration);

  // login user
  fastify.post('/initial/login', loginUser);

  done();
}
