'use client';
import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

import withAuth from '@/app/hoc/withAuth';

const Player = () => {
  const searchParams = useSearchParams();
  const videoRef = useRef(null);

  const search = searchParams.get('id');

  useEffect(() => {
    if (!search) {
      // Handle the case where 'id' is not available
      return;
    }

    const videoElement = videoRef.current;

    if (videoElement) {
      videoElement.src = `/api/v1/files/stream?id=${search}`;
    }
  }, [search]);

  return (
    <div>
      <video ref={videoRef} controls className='w-full' />
    </div>
  );
};

export default withAuth(Player);
