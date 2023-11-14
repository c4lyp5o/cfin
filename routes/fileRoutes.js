import {
  getAllFiles,
  streamFile,
  createFile,
  updateFile,
  deleteFile,
} from '../controllers/fileController.js';

export default function (fastify, opts, done) {
  // Get all files
  fastify.get('/files', getAllFiles);

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
