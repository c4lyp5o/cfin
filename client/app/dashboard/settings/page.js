// pages/settings.js
'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

import withAuth from '@/app/hoc/withAuth';
import DirectoryTree from '@/app/components/directorytree';

function Settings() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [folder, setFolder] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const sendData = async () => {
      try {
        const data = { folder };
        const token = localStorage.getItem('cfin');
        const user = JSON.parse(token);
        console.log(user);
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const response = await axios.post('/api/v1/folders/save', data, config);
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    };
    sendData();
  };

  return (
    <div className='min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12'>
      <div className='relative py-3 sm:max-w-xl sm:mx-auto'>
        <div className='relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10'>
          <div className='max-w-md mx-auto'>
            <form onSubmit={handleSubmit}>
              <div className='flex flex-col mb-6'>
                <label className='mb-1 text-xs tracking-wide text-gray-600'>
                  Username:
                </label>
                <input
                  type='text'
                  className='border-2 rounded-lg px-3 py-2 mt-1 mb-5 text-sm text-gray-900'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className='flex flex-col mb-6'>
                <label className='mb-1 text-xs tracking-wide text-gray-600'>
                  Email:
                </label>
                <input
                  type='email'
                  className='border-2 rounded-lg px-3 py-2 mt-1 mb-5 text-sm text-gray-900'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className='flex flex-col mb-6'>
                <label className='mb-1 text-xs tracking-wide text-gray-600'>
                  Folder to scan for videos: {folder}
                </label>
                <div className='border-2 rounded-lg px-3 py-2 mt-1 mb-5 text-sm text-gray-900'>
                  <DirectoryTree setFolder={setFolder} />
                </div>
              </div>
              <button
                type='submit'
                className='transition duration-200 bg-blue-500 hover:bg-blue-600 rounded-lg text-white w-full py-2'
              >
                Save
              </button>
            </form>
          </div>
        </div>
        {folder && folder.name}
      </div>
    </div>
  );
}

export default withAuth(Settings);
