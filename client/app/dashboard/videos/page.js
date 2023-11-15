'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

import withAuth from '@/app/hoc/withAuth';

const Videos = () => {
  const [files, setFiles] = useState([]);

  const convertBytes = (bytes) => {
    bytes = Number(bytes);
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
      return 'n/a';
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) {
      return `${bytes} ${sizes[i]})`;
    }
    return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const token = localStorage.getItem('cfin');
        const user = JSON.parse(token);

        const response = await axios.get('/api/v1/files/videos', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        setFiles(response.data);
      } catch (error) {
        console.error('An error occurred:', error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className='p-4'>
      <h1 className='text-2xl mb-4'>Shared Videos</h1>
      <div className='grid grid-cols-3 gap-4'>
        {files.length > 0 ? (
          files.map((file) => (
            <button
              key={file.id}
              className='rounded-md border border-black border-1 p-2'
            >
              <h2 className='text-lg mb-2'>{file.fileName}</h2>
              <p>{file.filePath}</p>
              <p>{convertBytes(file.fileSize)}</p>
              <p>Last accessed: {file.lastAccessed}</p>
              <p>Total watch time: {file.totalWatchTime} seconds</p>
              <Link href={`/dashboard/player?id=${file.id}`}>
                <div className='mt-2 px-2 py-1 text-white bg-red-500 rounded-md hover:bg-red-600'>
                  Play Video
                </div>
              </Link>
            </button>
          ))
        ) : (
          <p>No files shared yet</p>
        )}
      </div>
    </div>
  );
};

export default withAuth(Videos);
