import fs from 'fs';
import os from 'os';
import path from 'path';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';

import prisma from '../database/client.js';

const exec = promisify(execCb);

const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
const musicExtensions = ['.mp3', '.wav', '.aac'];
const videoExtensions = ['.mp4', '.avi', '.mov', '.flv'];

const purgeSystemDirs = async (dirPath, filePath) => {
  try {
    const { stdout } = await exec(`attrib "${filePath}" /d`);
    const newDirPath = dirPath.replace(/\//g, '\\');
    const realAttribute = stdout
      .split(newDirPath)
      .filter((value) => value !== '')[0]
      .trim();
    return realAttribute.includes('S') || realAttribute.includes('H');
  } catch (err) {
    console.log(err);
    return false;
  }
};

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
  const platform = os.platform();

  if (platform === 'win32') {
    try {
      const { stdout } = await exec('wmic logicaldisk get name');
      const drives = stdout
        .split('\n')
        .filter((value) => value.trim() !== '')
        .slice(1)
        .map((drive) => ({ name: drive.trim(), type: 'drive' }));
      reply.send({ drives: drives, platform: platform });
    } catch (err) {
      console.log(err);
      reply.code(500).send({ message: 'Failed to read drives' });
    }
  } else {
    const paths = ['/mnt', '/media'];
    if (platform === 'darwin') {
      paths.push('/Volumes');
    }

    const drives = paths.map((path) => {
      try {
        return fs
          .readdirSync(path)
          .map((name) => ({ name: `${path}/${name}`, type: 'drive' }));
      } catch (err) {
        console.log(err);
        reply.code(500).send({ message: 'Failed to read drives' });
      }
    });

    let realDrives = [];
    drives.forEach((drive) => {
      realDrives = realDrives.concat(drive);
    });

    realDrives = [{ name: '/', type: 'drive' }, ...realDrives];

    reply.send({ drives: realDrives, platform: platform });
  }
};

const getAllFolders = async (request, reply) => {
  const directoryPath = request.query.path || '/';

  try {
    const platform = os.platform();

    let files = await fs.promises.readdir(directoryPath);
    files = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(directoryPath, file);
        if (platform === 'win32') {
          if (await purgeSystemDirs(directoryPath, filePath)) {
            return null;
          }
        }
        if (!fs.statSync(filePath).isDirectory()) {
          return null;
        }
        return {
          name: file,
          path: filePath,
        };
      })
    );
    const allDir = files.filter((file) => file !== null);
    reply.send(allDir);
  } catch (err) {
    console.log(err);
    reply.code(500).send({ message: 'Failed to read directory' });
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
    reply.code(500).send({ message: err.message });
  }
};

const saveSharedFolder = async (request, reply) => {
  const { id } = request.session.user;
  const { folder: selectedFolder } = request.body;
  const existingFolder = await prisma.sharedFolders.findUnique({
    where: { folderPath: selectedFolder },
  });

  if (existingFolder) {
    reply.code(400).send({ message: 'Folder already exists' });
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
      reply.code(500).send({ message: 'No files found' });
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
    reply.code(500).send({ message: err.message });
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
