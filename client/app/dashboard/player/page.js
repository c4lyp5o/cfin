'use client';
import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const Player = () => {
  const searchParams = useSearchParams();

  const search = searchParams.get('id');

  return (
    <div>
      <video
        preload='metadata'
        src={`/api/v1/files/stream?id=${search}`}
        controls
        className='w-full'
      />
    </div>
  );
};

export default Player;
