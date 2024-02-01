import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import mime from 'mime-types';
import prisma from '../database/client.js';

const getAllFiles = async (request, reply) => {
  const fileType = request.params.type;

  let files;

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

  const filesWithSizeAsString = files.map((file) => ({
    ...file,
    fileSize: file.fileSize.toString(),
  }));

  reply.send(filesWithSizeAsString);
};

const getFileInfo = async (request, reply) => {
  const id = request.query.id;

  if (!id) {
    reply.code(400).send({ error: 'Missing ID parameter' });
    return;
  }

  let file;
  try {
    file = await prisma.sharedFiles.findUnique({
      where: { id: Number(id) },
    });
  } catch (error) {
    reply.code(500).send({ error: 'Error retrieving file info' });
    return;
  }

  if (!file) {
    reply.code(404).send({ error: 'File not found' });
    return;
  }

  const filePath = file.filePath;
  const absoluteFilePath = path.resolve(filePath);

  try {
    await fs.promises.access(absoluteFilePath);
  } catch (error) {
    reply.code(404).send({ error: 'File not found on the server' });
    return;
  }

  let fileStat;
  try {
    fileStat = await fs.promises.stat(absoluteFilePath);
  } catch (error) {
    reply.code(500).send({ error: 'Error retrieving file stats' });
    return;
  }

  const fileName = file.fileName;
  const fileExtension = file.fileExtension;
  const fileSize = fileStat.size;
  const lastAccessed = fileStat.atime;
  const totalWatchTime = file.totalWatchTime;

  let signedKey;
  try {
    const randomString = crypto.randomBytes(32).toString('hex');
    signedKey = await prisma.signedKeys.create({
      data: {
        key: randomString,
      },
    });
  } catch (error) {
    reply.code(500).send({ error: 'Error creating signed key' });
    return;
  }

  reply.send({
    fileName,
    fileSize,
    fileExtension,
    lastAccessed,
    totalWatchTime,
    signedKey: signedKey.key,
  });
};

const streamFile = async (request, reply) => {
  const { id } = request.query;

  if (!id) {
    reply.code(403);
    return reply.send('Forbidden');
  }

  let file;
  try {
    file = await prisma.sharedFiles.findUnique({
      where: { id: Number(id) },
    });
  } catch (error) {
    reply.code(500).send({ error: 'Error retrieving file info' });
    return;
  }

  if (!file) {
    reply.code(404).send({ error: 'File not found' });
    return;
  }

  const filePath = file.filePath;
  const absoluteFilePath = path.resolve(filePath);

  try {
    await fs.promises.access(absoluteFilePath);
  } catch (error) {
    reply.code(404).send({ error: 'File not found on the server' });
    return;
  }

  let fileStat;
  try {
    fileStat = await fs.promises.stat(absoluteFilePath);
  } catch (error) {
    reply.code(500).send({ error: 'Error retrieving file stats' });
    return;
  }

  const fileSize = fileStat.size;
  const contentType =
    mime.contentType(file.fileExtension) || 'application/octet-stream';

  const range = request.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunksize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };

    reply.code(206);
    reply.headers(head);
    return reply.send(fileStream);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    };
    reply.code(200);
    reply.headers(head);
    return reply.send(fs.createReadStream(filePath));
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
