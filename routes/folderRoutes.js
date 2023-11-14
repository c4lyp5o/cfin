import {
  getAllFolders,
  getAllSharedFolders,
  saveSharedFolder,
  updateSharedFolder,
  deleteSharedFolder,
} from '../controllers/folderController.js';

import checkToken from '../middleware/checkToken.js';

export default function (fastify, opts, done) {
  // Get all folders. this is for adding folders
  fastify.get('/folders/read', { prehandler: checkToken }, getAllFolders);

  // Get all shared folders
  fastify.get(
    '/folders/shared',
    { prehandler: checkToken },
    getAllSharedFolders
  );

  // Save folders for sharing
  fastify.post('/folders/save', { prehandler: checkToken }, saveSharedFolder);

  // Update a folder
  fastify.put('/folders/:id', { prehandler: checkToken }, updateSharedFolder);

  // Delete a folder
  fastify.delete(
    '/folders/:id',
    { prehandler: checkToken },
    deleteSharedFolder
  );

  done();
}
