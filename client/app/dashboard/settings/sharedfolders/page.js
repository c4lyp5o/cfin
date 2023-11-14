'use client';
import { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';

import withAuth from '@/app/hoc/withAuth';
import DirectoryTree from '@/app/components/directorytree';

function AddFolderModal({ openModal, closeModal }) {
  const [open, setOpen] = useState(true);
  const [folder, setFolder] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const sendData = async () => {
      try {
        const data = { folder };
        const token = localStorage.getItem('cfin');
        const user = JSON.parse(token);
        console.log(user);
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const response = await axios.post('/api/v1/folders/save', data, config);
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    };
    sendData();
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={openModal}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
          <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6'>
                <form onSubmit={handleSubmit}>
                  <div>
                    <div className='mt-3 text-center sm:mt-5'>
                      <Dialog.Title
                        as='h3'
                        className='text-base font-semibold leading-6 text-gray-900'
                      >
                        Choose Folder
                      </Dialog.Title>
                      <div className='mt-2'>
                        <DirectoryTree setFolder={setFolder} />
                      </div>
                    </div>
                  </div>
                  <div className='mt-5 sm:mt-6'>
                    <button
                      type='button'
                      className='inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                      onClick={closeModal}
                    >
                      Go back to dashboard
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function SharedFolders() {
  const [folders, setFolders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('cfin');
    const user = JSON.parse(token);

    fetch('/api/v1/folders/shared', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setFolders(data);
      });
  }, []);

  return (
    <div className='p-4'>
      <button
        onClick={openModal}
        className='mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
      >
        Add Folder To Share
      </button>
      <div className='grid grid-cols-3 gap-4'>
        {folders.length > 0 ? (
          folders.map((item) => (
            <button key={item.id} className='border p-2'>
              <h2 className='text-xl mb-2'>{item.folderName}</h2>
              <p>{item.folderPath}</p>
              <p>{item.folderSize}</p>
            </button>
          ))
        ) : (
          <p>No folders shared</p>
        )}
      </div>
      {isModalOpen && (
        <div
          onClick={closeModal}
          className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center'
        >
          <div className='bg-white p-4 rounded'>
            <AddFolderModal
              isModalOpen={isModalOpen}
              openModal={openModal}
              closeModal={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(SharedFolders);
