import fs from 'fs';
import path from 'path';
import prisma from '../database/client.js';

const getAllFiles = async (request, reply) => {
  const files = await prisma.sharedFiles.findMany();
  reply.send(files);
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

    const videoStat = fs.statSync(absoluteFilePath);
    const fileExtension = file.fileExtension;
    const fileSize = videoStat.size;

    reply.headers({
      'Content-Length': fileSize,
      'Content-Type': `video/${fileExtension.substring(1)}`,
    });

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

export { getAllFiles, streamFile, createFile, updateFile, deleteFile };
