import {
  getAllFiles,
  getFileInfo,
  streamFile,
  createFile,
  updateFile,
  deleteFile,
} from '../controllers/fileController.js';

export default function (fastify, opts, done) {
  fastify.addHook('preHandler', (request, reply, done) => {
    if (!request.session.authenticated) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    } else {
      done();
    }
  });

  // Get all files
  fastify.get('/files/:type', getAllFiles);

  // Get file info
  fastify.get('/files/info', getFileInfo);

  // Stream video files
  fastify.get('/files/stream', streamFile);

  // Create a file
  fastify.post('/files', createFile);

  // Update a file
  fastify.put('/files/:id', updateFile);

  // Delete a file
  fastify.delete('/files/:id', deleteFile);

  done();
}
