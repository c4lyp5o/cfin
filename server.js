import dotenv from 'dotenv';
import fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';

// Import routes
import initialRoutes from './routes/initialRoutes.js';
import userRoutes from './routes/userRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import fileRoutes from './routes/fileRoutes.js';

dotenv.config();

// Create fastify instance
const server = fastify({ logger: false });

// Register plugins
server.register(fastifyCookie);
server.register(fastifySession, {
  cookieName: 'sessionId',
  secret: 'a secret with minimum length of 32 characters',
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
  },
  expires: 1800000,
});
server.register(fastifyCors);
server.register(fastifyHelmet, { global: true });

// Register routes with '/api/' prefix
server.register(initialRoutes, { prefix: '/api/v1' });
server.register(userRoutes, { prefix: '/api/v1' });
server.register(folderRoutes, { prefix: '/api/v1' });
server.register(fileRoutes, { prefix: '/api/v1' });

server.route({
  method: 'GET',
  url: '/api/v1/validate',
  preHandler: async (request, reply) => {
    if (!request.session.authenticated) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }
  },
  handler: async (request, reply) => {
    reply.send({ message: 'Validated' });
  },
});

server.route({
  method: 'GET',
  url: '/api/v1/signout',
  preHandler: async (request, reply) => {
    if (!request.session.authenticated) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }
  },
  handler: async (request, reply) => {
    request.session.destroy();
    reply.send({ message: 'Signed Out' });
  },
});

const start = async () => {
  try {
    await server.listen({
      port: process.env.PORT || 5000,
    });
    server.log.info(`Server listening on ${server.server.address().port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
