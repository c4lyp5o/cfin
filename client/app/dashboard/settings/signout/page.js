'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

import withAuth from '@/app/hoc/withAuth';

const SignOutPage = () => {
  const router = useRouter();

  const handleSignOut = () => {
    try {
      localStorage.clear();
      router.replace('/');
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <div className='flex items-center justify-center h-screen'>
      <button
        onClick={handleSignOut}
        className='px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600'
        aria-label='Sign Out'
      >
        Sign Out
      </button>
    </div>
  );
};

export default withAuth(SignOutPage);
