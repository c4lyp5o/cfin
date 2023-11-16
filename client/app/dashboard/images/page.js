'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';

import afterLogin from '@/app/hoc/afterLogin';

const Images = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/v1/files/images');
        const data = await response.json();

        setFiles(data);
      } catch (error) {
        console.error('An error occurred:', error);
        toast.error('An error occurred. Please try again.');
      }
    };

    fetchImages();
  }, []);

  return (
    <div className='p-4'>
      <h1 className='text-2xl mb-4'>Shared Images</h1>
      <div className='grid grid-cols-3 gap-4'>
        {files.length > 0 ? (
          files.map((file) => (
            <button key={file.id} className='border p-2'>
              <h2 className='text-xl mb-2'>{file.fileName}</h2>
              <p>{file.filePath}</p>
              <p>{file.fileSize} bytes</p>
              <p>Last accessed: {file.lastAccessed}</p>
              <p>Total watch time: {file.totalWatchTime} seconds</p>
              <Link href={`/dashboard/player?id=${file.id}`}>Play Video</Link>
            </button>
          ))
        ) : (
          <p>No files shared yet</p>
        )}
      </div>
    </div>
  );
};

export default afterLogin(Images);
