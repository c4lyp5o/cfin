// routes/fileRoutes.js
import fs from 'fs';
import path from 'path';
import prisma from '../database/client.js';

export default function (fastify, opts, done) {
  // Get all files
  fastify.get('/files', async (request, reply) => {
    const files = await prisma.sharedFiles.findMany();
    reply.send(files);
  });

  // Get all files
  fastify.get('/files/stream', async (request, reply) => {
    try {
      // get req query named id
      const id = request.query.id;

      // get file from db
      const file = await prisma.sharedFiles.findUnique({
        where: { id: Number(id) },
      });

      // get file path from db
      const filePath = file.filePath;

      // get file size from db
      const stat = fs.statSync(filePath);

      // get file extension from db
      const fileExtension = file.fileExtension;

      // set response headers
      reply.headers({
        'Content-Length': stat.size,
        'Content-Type': `video/${fileExtension}`,
      });

      // stream file
      const stream = fs.createReadStream(filePath);
      reply.send(stream);
    } catch (err) {
      console.log(err);
      reply.code(500).send({ error: 'Failed to read file' });
    }
  });

  // Create a file
  fastify.post('/files', async (request, reply) => {
    const file = await prisma.sharedFiles.create({
      data: request.body,
    });
    reply.send(file);
  });

  // Update a file
  fastify.put('/files/:id', async (request, reply) => {
    const file = await prisma.sharedFiles.update({
      where: { id: Number(request.params.id) },
      data: request.body,
    });
    reply.send(file);
  });

  // Delete a file
  fastify.delete('/files/:id', async (request, reply) => {
    const file = await prisma.sharedFiles.delete({
      where: { id: Number(request.params.id) },
    });
    reply.send(file);
  });

  done();
}
