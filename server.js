import dotenv from 'dotenv';
import fastify from 'fastify';

// Import routes
import initialRoutes from './routes/initialRoutes.js';
import userRoutes from './routes/userRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import fileRoutes from './routes/fileRoutes.js';

dotenv.config();

// Create fastify instance
const server = fastify({ logger: false });

// Register routes with '/api/' prefix
server.register(initialRoutes, { prefix: '/api/v1' });
server.register(userRoutes, { prefix: '/api/v1' });
server.register(folderRoutes, { prefix: '/api/v1' });
server.register(fileRoutes, { prefix: '/api/v1' });

const start = async () => {
  try {
    await server.listen({
      port: 5000,
    });
    server.log.info(`server listening on ${server.server.address().port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
