import fs from 'fs';
import os from 'os';
import path from 'path';
import prisma from '../database/client.js';

const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
const musicExtensions = ['.mp3', '.wav', '.aac'];
const videoExtensions = ['.mp4', '.avi', '.mov', '.flv'];

const getFileDetails = (filePath) => ({
  fileName: path.basename(filePath),
  filePath: filePath,
  fileSize: fs.statSync(filePath).size.toString(),
  fileType: getFileType(filePath),
  fileExtension: path.extname(filePath),
});

const getFileType = (filePath) => {
  const ext = path.extname(filePath);
  if (imageExtensions.includes(ext)) return 'image';
  if (musicExtensions.includes(ext)) return 'music';
  if (videoExtensions.includes(ext)) return 'video';
  return 'other';
};

const readDirRecursive = async (folderPath) => {
  const entries = await fs.promises.readdir(folderPath, {
    withFileTypes: true,
  });

  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(folderPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await readDirRecursive(entryPath)));
    } else if (entry.isFile()) {
      files.push(getFileDetails(entryPath));
    }
  }

  return files;
};

const getAllDrives = async (request, reply) => {
  if (os.platform() === 'win32') {
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
  } else {
    const paths = ['/mnt', '/media'];
    if (os.platform() === 'darwin') {
      paths.push('/Volumes');
    }

    const drives = paths.map((path) => {
      try {
        return fs
          .readdirSync(path)
          .map((name) => ({ name: `${path}/${name}` }));
      } catch (err) {
        console.log(err);
        return [];
      }
    });

    let realDrives = [];
    drives.forEach((drive) => {
      realDrives = realDrives.concat(drive);
    });

    realDrives = [{ name: '/' }, ...realDrives];

    reply.send(realDrives);
  }
};

const getAllFolders = async (request, reply) => {
  const directoryPath = request.query.path || '/';

  try {
    const files = await fs.promises.readdir(directoryPath);
    const allDir = files.map((file) => {
      return {
        name: file,
        path: path.join(directoryPath, file),
        type: fs.statSync(path.join(directoryPath, file)).isDirectory()
          ? 'folder'
          : 'file',
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
  const { folder: selectedFolder } = request.body;
  const existingFolder = await prisma.sharedFolders.findUnique({
    where: { folderPath: selectedFolder },
  });

  if (existingFolder) {
    reply.code(400).send({ error: 'Folder already exists' });
    return;
  }

  try {
    const files = await readDirRecursive(selectedFolder);

    const videoFiles = files
      .filter((file) => videoExtensions.includes(file.fileExtension))
      .map((file) => ({
        ...file,
        fileSize: file.fileSize.toString(),
      }));

    const imageFiles = files
      .filter((file) => imageExtensions.includes(file.fileExtension))
      .map((file) => ({
        ...file,
        fileSize: file.fileSize.toString(),
      }));

    const musicFiles = files
      .filter((file) => musicExtensions.includes(file.fileExtension))
      .map((file) => ({
        ...file,
        fileSize: file.fileSize.toString(),
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

    const processedFolder = await prisma.sharedFolders.create({
      data: {
        userId: id,
        folderPath: selectedFolder,
        folderName: path.basename(selectedFolder),
        folderSize: folderSize,
        files: {
          create: [...videoFiles, ...imageFiles, ...musicFiles],
        },
      },
    });

    reply.send(processedFolder);
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
