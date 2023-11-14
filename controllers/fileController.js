import fs from 'fs';
import path from 'path';
import prisma from '../database/client.js';

const getAllFiles = async (request, reply) => {
  const fileType = request.params.type;

  let files;

  try {
    switch (fileType) {
      case 'images':
        files = await prisma.sharedFiles.findMany({
          where: { fileType: 'image' },
        });
        break;
      case 'videos':
        files = await prisma.sharedFiles.findMany({
          where: { fileType: 'video' },
        });
        break;
      default:
        files = await prisma.sharedFiles.findMany({
          where: { fileType: 'music' },
        });
        break;
    }

    reply.send(files);
  } catch (err) {
    reply.code(500).send({ error: err.message });
  }
};

const getFileInfo = async (request, reply) => {
  const id = request.query.id;

  if (!id) {
    reply.code(400).send({ error: 'Missing ID parameter' });
    return;
  }

  const file = await prisma.sharedFiles.findUnique({
    where: { id: Number(id) },
  });

  if (!file) {
    reply.code(404).send({ error: 'File not found' });
    return;
  }

  const filePath = file.filePath;
  const absoluteFilePath = path.resolve(filePath);

  if (!fs.existsSync(absoluteFilePath)) {
    reply.code(404).send({ error: 'File not found on the server' });
    return;
  }

  const fileStat = fs.statSync(absoluteFilePath);
  const fileName = file.fileName;
  const fileExtension = file.fileExtension;
  const fileSize = fileStat.size;
  const lastAccessed = fileStat.atime;
  const totalWatchTime = file.totalWatchTime;

  reply.send({
    fileName,
    fileSize,
    fileExtension,
    lastAccessed,
    totalWatchTime,
  });
};

const streamFile = async (request, reply) => {
  try {
    const id = request.query.id;

    if (!id) {
      reply.code(400).send({ error: 'Missing ID parameter' });
      return;
    }

    const file = await prisma.sharedFiles.findUnique({
      where: { id: Number(id) },
    });

    if (!file) {
      reply.code(404).send({ error: 'File not found' });
      return;
    }

    const filePath = file.filePath;
    const absoluteFilePath = path.resolve(filePath);

    if (!fs.existsSync(absoluteFilePath)) {
      reply.code(404).send({ error: 'File not found on the server' });
      return;
    }

    const fileStat = fs.statSync(absoluteFilePath);
    const fileExtension = file.fileExtension;
    const fileSize = fileStat.size;

    switch (fileExtension) {
      case '.mp4':
      case '.avi':
      case '.mov':
      case '.flv':
        reply.headers({
          'Content-Length': fileSize,
          'Content-Type': `video/${fileExtension.substring(1)}`,
        });
        break;
      case '.png':
      case '.jpg':
      case '.jpeg':
      case '.gif':
        reply.headers({
          'Content-Length': fileSize,
          'Content-Type': `image/${fileExtension.substring(1)}`,
        });
        break;
      default:
        reply.headers({
          'Content-Length': fileSize,
          'Content-Type': `audio/${fileExtension.substring(1)}`,
        });
        break;
    }

    const stream = fs.createReadStream(absoluteFilePath);
    return reply.send(stream);
  } catch (err) {
    console.error(err);
    reply.code(500).send({ error: 'Failed to read file' });
  }
};

const createFile = async (request, reply) => {
  const file = await prisma.sharedFiles.create({
    data: request.body,
  });
  reply.send(file);
};

const updateFile = async (request, reply) => {
  const file = await prisma.sharedFiles.update({
    where: { id: Number(request.params.id) },
    data: request.body,
  });
  reply.send(file);
};

const deleteFile = async (request, reply) => {
  const file = await prisma.sharedFiles.delete({
    where: { id: Number(request.params.id) },
  });
  reply.send(file);
};

export {
  getAllFiles,
  getFileInfo,
  streamFile,
  createFile,
  updateFile,
  deleteFile,
};
