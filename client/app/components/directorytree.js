import React, { useState, useEffect, Suspense } from 'react';
import { FolderIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const Structure = ({
  drive,
  contents,
  handleItemClick,
  handleGoBackDirectory,
}) => {
  return (
    <div>
      {drive && (
        <div
          className='cursor-pointer text-black hover:text-blue-500 mr-4 flex items-center'
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
          {item.type === 'drive' ? (
            <ComputerDesktopIcon className='h-5 w-5 mr-2' />
          ) : (
            <FolderIcon className='h-5 w-5 mr-2' />
          )}
          {item.name}
        </div>
      ))}
    </div>
  );
};

const DirectoryTree = ({ folder, setFolder }) => {
  const [allDrives, setAllDrives] = useState([]);
  const [drive, setDrive] = useState('');
  const [platform, setPlatform] = useState('');
  const [path, setPath] = useState('/');
  const [contents, setContents] = useState([]);
  const [error, setError] = useState(null);

  const joinPath = (...args) => args.join('/').replace(/\/+/g, '/');

  const handleItemClick = (item) => {
    if (drive) {
      const newPath = joinPath(path, item.name);
      setPath(newPath);
      setFolder(joinPath(drive, newPath));
      console.table({ drive, path, newPath });
    } else {
      setDrive(item.name);
      setPath('/');
      setFolder(item.name);
      console.table({ drive: item.name, path: '/', folder: item.name });
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
      console.log(newPath);
      if (drive === '/' && newPath !== '') {
        console.log('if');
        newFolder = newPath;
      } else {
        console.log('else');
        newFolder = `${drive}${newPath}`;
      }
    }

    setDrive(newDrive);
    setPath(newPath);
    setFolder(newFolder);
    console.table({ drive: newDrive, path: newPath, folder: newFolder });
  };

  useEffect(() => {
    const readDir = async () => {
      try {
        let response;

        if (drive) {
          switch (platform) {
            case 'win32':
              const realPath = path === '' ? '/' : path;
              response = await fetch(
                `/api/v1/folders/read?path=${encodeURIComponent(
                  drive + realPath
                )}`
              );
              break;
            case 'linux':
            case 'darwin':
              response = await fetch(
                `/api/v1/folders/read?path=${encodeURIComponent(
                  `${drive}${path}`
                )}`
              );
              break;
            default:
              throw new Error('Unsupported platform');
          }
        } else {
          response = await fetch(`/api/v1/folders/drives`);
        }

        if (!response.ok) {
          setError(response.statusText);
          throw new Error(response.statusText);
        }

        const data = await response.json();
        console.log(data);
        if (!drive) {
          const { drives, platform } = data;
          setAllDrives(drives);
          setPlatform(platform);
          setContents(drives);
        } else {
          setContents(data);
        }
      } catch (error) {
        setError(error.message);
      }
    };

    try {
      readDir();
    } catch (error) {
      setError(error.message);
      toast.error('Folder is not accessible');
    }
  }, [drive, path, platform, setAllDrives, setContents]);

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
      <Suspense fallback={<div>Loading...</div>}>
        <Structure
          drive={drive}
          contents={contents}
          handleItemClick={handleItemClick}
          handleGoBackDirectory={handleGoBackDirectory}
        />
      </Suspense>
    </div>
  );
};

export default DirectoryTree;
