import React, { useState, useEffect } from 'react';
import { FolderIcon } from '@heroicons/react/24/outline';

const DirectoryTree = ({ setFolder }) => {
  const [path, setPath] = useState('/');
  const [contents, setContents] = useState([]);

  useEffect(() => {
    const readDir = async () => {
      try {
        const token = localStorage.getItem('cfin');
        const user = JSON.parse(token);

        const response = await fetch(
          `/api/v1/folders/read?path=${encodeURIComponent(path)}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Error reading directory');
        }

        const data = await response.json();
        setContents(data);
      } catch (error) {
        console.error('An error occurred:', error);
      }
    };
    readDir();
  }, [path]);

  return (
    <div className='flex flex-wrap'>
      <button
        className='mb-3 w-full px-4 py-2 text-white bg-green-500 rounded-full hover:bg-green-600'
        aria-label='Current Path'
      >
        Current Path: {path}
      </button>
      {/* back button */}
      {path !== '/' && (
        <div
          className='cursor-pointer text-black hover:text-blue-500 mr-4'
          onClick={() => setPath(path.split('/').slice(0, -1).join('/'))}
          aria-label='Back'
        >
          ..
        </div>
      )}
      {contents.map((item, index) => (
        <div
          key={index}
          className='cursor-pointer text-black hover:text-blue-500 mr-4 flex items-center'
          onClick={() => {
            setPath(`${path}/${item.name}`);
            setFolder(`${path}/${item.name}`);
          }}
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
