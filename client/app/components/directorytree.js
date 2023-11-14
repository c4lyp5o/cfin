import React, { useState, useEffect } from 'react';
import { FolderIcon } from '@heroicons/react/24/outline';

const DirectoryTree = ({ setFolder }) => {
  const [path, setPath] = useState('/');
  const [contents, setContents] = useState([]);

  useEffect(() => {
    const readDir = async () => {
      try {
        const response = await fetch(
          `/api/v1/folders/read?path=${encodeURIComponent(path)}`
        );
        const data = await response.json();
        setContents(data);
      } catch (error) {
        console.log(error);
      }
    };
    readDir();
  }, [path]);

  return (
    <div className='flex flex-wrap'>
      <div className='w-full'>Current Path: {path}</div>
      {/* back button */}
      {path !== '/' && (
        <div
          className='cursor-pointer text-black hover:text-blue-500 mr-4'
          onClick={() => setPath(path.split('/').slice(0, -1).join('/'))}
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
        >
          <FolderIcon className='h-5 w-5 mr-2' />
          {item.name}
        </div>
      ))}
    </div>
  );
};

export default DirectoryTree;
