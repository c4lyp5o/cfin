'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

import withAuth from '@/app/hoc/withAuth';

const Music = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    axios.get('/api/v1/files').then((response) => {
      console.log(response.data);
      setFiles(response.data);
    });
  }, []);

  return (
    <div className='p-4'>
      <h1 className='text-2xl mb-4'>Shared Files</h1>
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

export default withAuth(Music);
