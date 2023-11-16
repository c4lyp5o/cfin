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

  const folderWithSizeAsString = folders.map((f) => ({
    ...f,
    folderSize: f.folderSize.toString(),
    files: f.files.map((file) => ({
      ...file,
      fileSize: file.fileSize.toString(),
    })),
  }));

  reply.send(folderWithSizeAsString);
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

    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
    const musicExtensions = ['.mp3', '.wav', '.aac'];
    const videoExtensions = ['.mp4', '.avi', '.mov', '.flv'];

    const videoFiles = files
      .filter((file) => videoExtensions.includes(path.extname(file)))
      .map((file) => ({
        fileName: file,
        filePath: path.join(folderPath, file),
        fileSize: fs.statSync(path.join(folderPath, file)).size.toString(),
        fileType: 'video',
        fileExtension: path.extname(file),
      }));

    const imageFiles = files
      .filter((file) => imageExtensions.includes(path.extname(file)))
      .map((file) => ({
        fileName: file,
        filePath: path.join(folderPath, file),
        fileSize: fs.statSync(path.join(folderPath, file)).size.toString(),
        fileType: 'image',
        fileExtension: path.extname(file),
      }));

    const musicFiles = files
      .filter((file) => musicExtensions.includes(path.extname(file)))
      .map((file) => ({
        fileName: file,
        filePath: path.join(folderPath, file),
        fileSize: fs.statSync(path.join(folderPath, file)).size.toString(),
        fileType: 'music',
        fileExtension: path.extname(file),
      }));

    if (
      videoFiles.length === 0 &&
      imageFiles.length === 0 &&
      musicFiles.length === 0
    ) {
      reply.code(400).send({ error: 'No files found' });
      return;
    }

    const folderSize = (
      videoFiles
        .map((file) => BigInt(file.fileSize))
        .reduce((acc, size) => acc + size, BigInt(0)) +
      imageFiles
        .map((file) => BigInt(file.fileSize))
        .reduce((acc, size) => acc + size, BigInt(0)) +
      musicFiles
        .map((file) => BigInt(file.fileSize))
        .reduce((acc, size) => acc + size, BigInt(0))
    ).toString();

    const folder = await prisma.SharedFolders.create({
      data: {
        userId: decoded.id,
        folderPath: folderPath,
        folderName: path.basename(folderPath),
        folderSize: folderSize,
        files: {
          create: [
            ...videoFiles.map((file) => ({
              fileName: file.fileName,
              filePath: file.filePath,
              fileSize: file.fileSize.toString(),
              fileType: file.fileType,
              fileExtension: file.fileExtension,
            })),
            ...imageFiles.map((file) => ({
              fileName: file.fileName,
              filePath: file.filePath,
              fileSize: file.fileSize.toString(),
              fileType: file.fileType,
              fileExtension: file.fileExtension,
            })),
            ...musicFiles.map((file) => ({
              fileName: file.fileName,
              filePath: file.filePath,
              fileSize: file.fileSize.toString(),
              fileType: file.fileType,
              fileExtension: file.fileExtension,
            })),
          ],
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
  // delete all files in SharedFiles table
  await prisma.SharedFiles.deleteMany({
    where: { folderId: Number(request.params.id) },
  });

  // delete folder in SharedFolders table
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
