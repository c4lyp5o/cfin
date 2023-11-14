'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

import withAuth from '@/app/hoc/withAuth';

const Player = () => {
  const searchParams = useSearchParams();
  const search = searchParams.get('id');

  const videoRef = useRef(null);

  const [mediaInfo, setMediaInfo] = useState({});

  useEffect(() => {
    const fetchMediaInfo = async () => {
      if (!search) {
        // Handle the case where 'id' is not available
        return;
      }

      const token = localStorage.getItem('cfin');
      const user = JSON.parse(token);

      try {
        const response = await fetch(`/api/v1/files/info?id=${search}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error fetching media info');
        }

        const data = await response.json();
        setMediaInfo(data);
      } catch (error) {
        console.error('An error occurred:', error);
      }

      const videoElement = videoRef.current;

      fetch(`/api/v1/files/stream?id=${search}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
        .then((response) => response.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          videoElement.src = url;
        })
        .catch((error) => console.error('An error occurred:', error));
    };

    fetchMediaInfo();
  }, [search]);

  return (
    <div className='flex flex-col items-center'>
      <video ref={videoRef} controls className='w-full mb-4' />
      <div className='text-center'>
        <h2 className='text-xl mb-2'>{mediaInfo.fileName}</h2>
        <p className='mb-2'>Size: {mediaInfo.fileSize} bytes</p>
        <p className='mb-2'>Last accessed: {mediaInfo.lastAccessed}</p>
        <p>Total watch time: {mediaInfo.totalWatchTime} seconds</p>
      </div>
    </div>
  );
};

export default withAuth(Player);
