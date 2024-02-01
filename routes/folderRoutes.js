import {
  getAllDrives,
  getAllFolders,
  getAllSharedFolders,
  saveSharedFolder,
  updateSharedFolder,
  deleteSharedFolder,
} from '../controllers/folderController.js';

export default function (fastify, opts, done) {
  fastify.addHook('preHandler', (request, reply, done) => {
    if (!request.session.authenticated) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    } else {
      done();
    }
  });

  // Get all drives. this is for adding drives
  fastify.get('/folders/drives', getAllDrives);

  // Get all folders. this is for adding folders
  fastify.get('/folders/read', getAllFolders);

  // Get all shared folders
  fastify.get('/folders/shared', getAllSharedFolders);

  // Save folders for sharing
  fastify.post('/folders/save', saveSharedFolder);

  // Update a folder
  fastify.put('/folders/:id', updateSharedFolder);

  // Delete a folder
  fastify.delete('/folders/:id', deleteSharedFolder);

  done();
}
