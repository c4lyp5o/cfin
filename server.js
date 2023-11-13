import fastify from 'fastify';
// import staticServe from 'fastify-static';

// import fs from 'fs';
// import path from 'path';

// Import routes
import userRoutes from './routes/userRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import fileRoutes from './routes/fileRoutes.js';

import prisma from './database/client.js';

// Create fastify instance
const server = fastify({ logger: false });

// Register routes with '/api/' prefix
server.register(userRoutes, { prefix: '/api/v1' });
server.register(folderRoutes, { prefix: '/api/v1' });
server.register(fileRoutes, { prefix: '/api/v1' });

// Route to check if there are any users
server.get('/api/v1/initial', async (req, reply) => {
  const users = await prisma.userConfig.findMany();
  if (users.length === 0) {
    reply.send({ showRegistration: true });
  } else {
    reply.send({ showRegistration: false });
  }
});

// // video server
// server.get('/videos/:folderName/*', async (request, reply) => {
//   const folderName = request.params.folderName;
//   const filePath = request.params['*'];

//   // Register the static directory for this folder
//   server.register(staticServe, {
//     root: path.join(__dirname, `/home/calypso/${folderName}`),
//     prefix: `/videos/${folderName}/`, // optional: default '/'
//   });

//   // Redirect to the static file
//   reply.redirect(`/videos/${folderName}/${filePath}`);
// });

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
