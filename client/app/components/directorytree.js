import React, { useState, useEffect } from 'react';

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
    <ul className='list-disc pl-5'>
      Current Path: {path}
      {/* back button */}
      {path !== '/' && (
        <li className='my-1'>
          <div
            className='cursor-pointer hover:text-blue-500'
            onClick={() => setPath(path.split('/').slice(0, -1).join('/'))}
          >
            ..
          </div>
        </li>
      )}
      {contents.map((item, index) => (
        <li key={index} className='my-1'>
          <div
            className='cursor-pointer hover:text-blue-500'
            onClick={() => {
              setPath(`${path}/${item.name}`);
              setFolder(`${path}/${item.name}`);
            }}
          >
            {item.name}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default DirectoryTree;
