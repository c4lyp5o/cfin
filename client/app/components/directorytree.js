import React, { useState, useEffect, useReducer, Suspense } from 'react';
import { FolderIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const initialState = {
  drive: '',
  path: '/',
  platform: '',
  allDrives: [],
  contents: [],
  prevContents: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_DRIVE':
      return { ...state, drive: action.payload };
    case 'SET_PATH':
      return { ...state, path: action.payload };
    case 'SET_PLATFORM':
      return { ...state, platform: action.payload };
    case 'SET_ALL_DRIVES':
      return { ...state, allDrives: action.payload };
    case 'SET_CONTENTS':
      return {
        ...state,
        contents: action.payload,
        prevContents: state.contents,
      };
    default:
      throw new Error();
  }
};

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
  const [state, dispatch] = useReducer(reducer, initialState);

  const joinPath = (...args) => args.join('/').replace(/\/+/g, '/');

  const handleItemClick = (item) => {
    const newPath = state.drive ? `${state.path}/${item.name}` : '/';
    const newDrive = state.drive || item.name;

    dispatch({ type: 'SET_DRIVE', payload: newDrive });
    dispatch({ type: 'SET_PATH', payload: newPath });
    setFolder(joinPath(newDrive, newPath));
  };

  const handleGoBackDirectory = () => {
    if (state.path === '/') {
      dispatch({ type: 'SET_DRIVE', payload: '' });
      dispatch({ type: 'SET_PATH', payload: '/' });
      setFolder('');
    } else {
      const newPath = state.path.split('/').slice(0, -1).join('/');
      dispatch({ type: 'SET_PATH', payload: newPath });
      setFolder(`${state.drive}${newPath}`);
    }
  };

  useEffect(() => {
    const readDir = async () => {
      try {
        const url = state.drive
          ? `/api/v1/folders/read?path=${encodeURIComponent(
              `${state.drive}${state.path}`
            )}`
          : `/api/v1/folders/drives`;

        const response = await fetch(url);

        if (!response.ok) {
          dispatch({ type: 'SET_DRIVE', payload: '' });
          dispatch({ type: 'SET_CONTENTS', payload: state.prevContents });
          throw new Error();
        }

        const data = await response.json();

        if (state.drive) {
          dispatch({ type: 'SET_CONTENTS', payload: data });
        } else {
          dispatch({ type: 'SET_ALL_DRIVES', payload: data.drives });
          dispatch({ type: 'SET_PLATFORM', payload: data.platform });
          dispatch({ type: 'SET_CONTENTS', payload: data.drives });
        }
      } catch (error) {
        toast.error('Folder is not accessible');
      }
    };

    readDir();
  }, [state.drive, state.path, state.platform]);

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
          drive={state.drive}
          contents={state.contents}
          handleItemClick={handleItemClick}
          handleGoBackDirectory={handleGoBackDirectory}
        />
      </Suspense>
    </div>
  );
};

export default DirectoryTree;
