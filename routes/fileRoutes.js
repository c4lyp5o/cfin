import {
  getAllFiles,
  getFileInfo,
  streamFile,
  createFile,
  updateFile,
  deleteFile,
} from '../controllers/fileController.js';

import checkToken from '../middleware/checkToken.js';

export default function (fastify, opts, done) {
  // Get all files
  fastify.get('/files/:type', { preHandler: checkToken }, getAllFiles);

  // Get file info
  fastify.get('/files/info', { preHandler: checkToken }, getFileInfo);

  // Stream video files
  fastify.get('/files/stream', { preHandler: checkToken }, streamFile);

  // Create a file
  fastify.post('/files', { preHandler: checkToken }, createFile);

  // Update a file
  fastify.put('/files/:id', { preHandler: checkToken }, updateFile);

  // Delete a file
  fastify.delete('/files/:id', { preHandler: checkToken }, deleteFile);

  done();
}
