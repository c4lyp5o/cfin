import React, { useState, useEffect } from 'react';
import { FolderIcon, DocumentIcon } from '@heroicons/react/24/outline';

const DirectoryTree = ({ folder, setFolder }) => {
  const [allDrives, setAllDrives] = useState([]);
  const [drive, setDrive] = useState(null);
  const [path, setPath] = useState('/');
  const [contents, setContents] = useState([]);
  const [error, setError] = useState(null);

  const joinPath = (...args) => args.join('/').replace(/\/+/g, '/');

  const handleItemClick = (item) => {
    if (drive) {
      const newPath = joinPath(path, item.name);
      setPath(newPath);
      setFolder(joinPath(drive, newPath));
    } else {
      setDrive(item.name);
      setPath('/');
      setFolder(item.name);
    }
  };

  const handleGoBackDirectory = () => {
    const driveNames = allDrives.map((drive) => drive.name);
    let newDrive = drive;
    let newPath = path;
    let newFolder = folder;

    if (driveNames.includes(folder)) {
      newDrive = null;
      newPath = null;
      newFolder = null;
    } else {
      newPath = path.split('/').slice(0, -1).join('/');
      if (drive === '/' && newPath !== '') {
        newFolder = newPath;
      } else {
        newFolder = `${drive}${newPath}`;
      }
    }

    setDrive(newDrive);
    setPath(newPath);
    setFolder(newFolder);
  };

  useEffect(() => {
    const readDir = async () => {
      try {
        let response;

        if (drive) {
          const test = encodeURIComponent(`${drive}${path}`);
          response = await fetch(`/api/v1/folders/read?path=${test}`);
        } else {
          response = await fetch(`/api/v1/folders/drives`);
        }

        if (!response.ok) {
          throw new Error('Error reading drives or folders.');
        }

        const data = await response.json();
        if (!drive) setAllDrives(data);
        setContents(data);
      } catch (error) {
        setError(error.message);
      }
    };
    readDir();
  }, [drive, path, setAllDrives, setContents]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className='flex flex-wrap'>
      <button
        type='button'
        className='mb-3 w-full px-4 py-2 text-white bg-green-500 rounded-full hover:bg-green-600'
        aria-label='Current Path'
      >
        Current Path: {folder}
      </button>
      {/* back button */}
      {drive && (
        <div
          className='cursor-pointer text-black hover:text-blue-500 mr-4'
          onClick={handleGoBackDirectory}
          aria-label='Back'
        >
          ..
        </div>
      )}
      {contents.map((item) => (
        <div
          key={item.name}
          className={`cursor-pointer text-black hover:text-blue-500 mr-4 flex items-center ${
            item.type === 'file' ? 'pointer-events-none' : ''
          }`}
          onClick={() => item.type !== 'file' && handleItemClick(item)}
          aria-label='Folder'
        >
          <FolderIcon className='h-5 w-5 mr-2' />
          {item.name}
        </div>
      ))}
    </div>
  );
};

export default DirectoryTree;
