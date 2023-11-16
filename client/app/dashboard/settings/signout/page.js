'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

import afterLogin from '@/app/hoc/afterLogin';

const SignOutPage = () => {
  const router = useRouter();

  const handleSignOut = () => {
    try {
      fetch('/api/v1/signout');
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

export default afterLogin(SignOutPage);
