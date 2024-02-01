import fs from 'fs';
import path from 'path';
const { exec } = require('child_process');
import prisma from '../database/client.js';

const getAllDrives = async (request, reply) => {
  exec('wmic logicaldisk get name', (err, stdout) => {
    if (err) {
      console.log(err);
      reply.code(500).send({ error: 'Failed to get drives' });
      return;
    }

    const drives = stdout
      .split('\n')
      .filter((value) => value.trim() !== '')
      .slice(1); // Remove the first line, which is the column name

    reply.send(drives);
  });
};

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
    console.log(err);
    reply.code(500).send({ error: 'Failed to read directory' });
  }
};

const getAllSharedFolders = async (request, reply) => {
  try {
    const folders = await prisma.sharedFolders.findMany({
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
  } catch (err) {
    console.log(err);
    reply.code(500).send({ error: err.message });
  }
};

const saveSharedFolder = async (request, reply) => {
  const { id } = request.session.user;
  const folderPath = request.body.folder.replace(/^\//, '');
  const existingFolder = await prisma.sharedFolders.findUnique({
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
      reply.code(500).send({ error: 'No files found' });
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

    const folder = await prisma.sharedFolders.create({
      data: {
        userId: id,
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
    console.log(err);
    reply.code(500).send({ error: err.message });
  }
};

const updateSharedFolder = async (request, reply) => {
  const folder = await prisma.sharedFolders.update({
    where: { id: Number(request.params.id) },
    data: request.body,
  });
  reply.send(folder);
};

const deleteSharedFolder = async (request, reply) => {
  // delete all files in SharedFiles table
  await prisma.sharedFiles.deleteMany({
    where: { folderId: Number(request.params.id) },
  });

  // delete folder in SharedFolders table
  const folder = await prisma.sharedFolders.delete({
    where: { id: Number(request.params.id) },
  });

  reply.send(folder);
};

export {
  getAllDrives,
  getAllFolders,
  getAllSharedFolders,
  saveSharedFolder,
  updateSharedFolder,
  deleteSharedFolder,
};
