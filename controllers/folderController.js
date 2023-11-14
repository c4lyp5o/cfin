import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

import prisma from '../database/client.js';

const getAllFolders = async (request, reply) => {
  const directoryPath = request.query.path || '/';

  try {
    const files = await fs.promises.readdir(directoryPath);
    const allDir = files.map((file) => {
      return {
        name: file,
        path: path.join(directoryPath, file),
      };
    });
    reply.send(allDir);
  } catch (err) {
    reply.code(500).send({ error: 'Failed to read directory' });
  }
};

const getAllSharedFolders = async (request, reply) => {
  const folders = await prisma.SharedFolders.findMany({
    include: { files: true },
  });
  reply.send(folders);
};

const saveSharedFolder = async (request, reply) => {
  const token = request.headers.authorization.split(' ')[1];

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const folderPath = request.body.folder.replace(/^\//, '');

  const existingFolder = await prisma.SharedFolders.findUnique({
    where: { folderPath: folderPath },
  });

  if (existingFolder) {
    reply.code(400).send({ error: 'Folder already exists' });
    return;
  }

  try {
    const files = await fs.promises.readdir(folderPath);

    const videoFiles = files
      .filter((file) => path.extname(file) === '.mp4')
      .map((file) => {
        return {
          fileName: file,
          filePath: path.join(folderPath, file),
          fileSize: fs.statSync(path.join(folderPath, file)).size,
          fileType: 'video',
          fileExtension: path.extname(file),
        };
      });

    if (videoFiles.length === 0) {
      reply.code(400).send({ error: 'No video files found' });
      return;
    }

    const folder = await prisma.SharedFolders.create({
      data: {
        userId: decoded.id,
        folderPath: folderPath,
        folderName: path.basename(folderPath),
        folderSize: videoFiles.reduce((acc, file) => acc + file.fileSize, 0),
        files: {
          create: videoFiles.map((file) => ({
            fileName: file.fileName,
            filePath: file.filePath,
            fileSize: file.fileSize,
            fileType: file.fileType,
            fileExtension: file.fileExtension,
          })),
        },
      },
    });

    reply.send(folder);
  } catch (err) {
    reply.code(500).send({ error: err.message });
  }
};

const updateSharedFolder = async (request, reply) => {
  const folder = await prisma.SharedFolders.update({
    where: { id: Number(request.params.id) },
    data: request.body,
  });
  reply.send(folder);
};

const deleteSharedFolder = async (request, reply) => {
  const folder = await prisma.SharedFolders.delete({
    where: { id: Number(request.params.id) },
  });
  reply.send(folder);
};

export {
  getAllFolders,
  getAllSharedFolders,
  saveSharedFolder,
  updateSharedFolder,
  deleteSharedFolder,
};
