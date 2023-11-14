'use client';
import { Fragment, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

import withAuth from '@/app/hoc/withAuth';

function AddUserModal({ closeModal }) {
  const [open, setOpen] = useState(true);
  const [createdUser, setCreatedUser] = useState({
    username: '',
    password: '',
    role: 'admin',
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!createdUser.username || !createdUser.password) {
      return toast.error('Username and password cannot be empty!');
    }

    const sendData = async () => {
      try {
        const token = localStorage.getItem('cfin');

        if (!token) {
          toast.error('No token found');
          return;
        }

        const user = JSON.parse(token);
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };

        await axios.post('/api/v1/users/create', createdUser, config);
        toast.success(`User ${createdUser.username} created`);
      } catch (error) {
        console.error('An error occurred:', error);
        toast.error(
          error.response.data.message ||
            `Error creating user ${createdUser.username}`
        );
      } finally {
        closeModal();
      }
    };
    sendData();
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={setOpen}>
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
                  <div className='mt-3 text-center sm:mt-5'>
                    <Dialog.Title
                      as='h3'
                      className='text-base font-semibold leading-6 text-gray-900'
                    >
                      Username
                    </Dialog.Title>
                    <input
                      onChange={(e) =>
                        setCreatedUser({
                          ...createdUser,
                          username: e.target.value,
                        })
                      }
                      className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                      type='text'
                    />
                  </div>
                  <div className='mt-3 text-center sm:mt-5'>
                    <Dialog.Title
                      as='h3'
                      className='text-base font-semibold leading-6 text-gray-900'
                    >
                      Password
                    </Dialog.Title>
                    <input
                      onChange={(e) =>
                        setCreatedUser({
                          ...createdUser,
                          password: e.target.value,
                        })
                      }
                      className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                      type='password'
                    />
                  </div>
                  <div className='mt-3 text-center sm:mt-5'>
                    <Dialog.Title
                      as='h3'
                      className='text-base font-semibold leading-6 text-gray-900'
                    >
                      Role
                    </Dialog.Title>
                    <select
                      defaultValue='admin'
                      onChange={(e) =>
                        setCreatedUser({
                          ...createdUser,
                          role: e.target.value,
                        })
                      }
                      className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                    >
                      <option value='admin'>Admin</option>
                      <option value='user'>User</option>
                    </select>
                  </div>
                  <div className='mt-5 sm:mt-6'>
                    <button
                      type='submit'
                      className='inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                    >
                      Submit
                    </button>
                    <button
                      type='button'
                      className='mt-2 inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600'
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

function DeleteUserModal({ closeModal, selectedUser }) {
  const [open, setOpen] = useState(true);

  const cancelButtonRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const deleteData = async () => {
      try {
        const token = localStorage.getItem('cfin');

        if (!token) {
          toast.error('No token found');
          return;
        }

        const user = JSON.parse(token);
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };

        await axios.delete(`/api/v1/users/${selectedUser.id}`, config);
        toast.success(`User ${selectedUser.username} deleted`);
      } catch (error) {
        console.error('An error occurred:', error);
        toast.error(
          error.response.data.message ||
            `Error deleting user ${selectedUser.username}`
        );
      } finally {
        closeModal();
      }
    };
    deleteData();
  };
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as='div'
        className='relative z-10'
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
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
              <Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6'>
                <form onSubmit={handleSubmit}>
                  <div className='sm:flex sm:items-start'>
                    <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10'>
                      <ExclamationTriangleIcon
                        className='h-6 w-6 text-red-600'
                        aria-hidden='true'
                      />
                    </div>
                    <div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left'>
                      <Dialog.Title
                        as='h3'
                        className='text-base font-semibold leading-6 text-gray-900'
                      >
                        Deactivate account
                      </Dialog.Title>
                      <div className='mt-2'>
                        <p className='text-sm text-gray-500'>
                          Are you sure you want to deactivate your account (
                          {selectedUser.username})? This action cannot be
                          undone.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='mt-5 sm:mt-4 sm:flex sm:flex-row-reverse'>
                    <button
                      type='submit'
                      className='inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto'
                    >
                      Deactivate
                    </button>
                    <button
                      type='button'
                      className='mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'
                      onClick={closeModal}
                      ref={cancelButtonRef}
                    >
                      Cancel
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

function UserManagement() {
  const [allUsers, setUsers] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedUser(null);
    setIsDeleteModalOpen(false);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('cfin');

      if (!token) {
        console.error('No token found');
        return;
      }

      let user;
      try {
        user = JSON.parse(token);
      } catch (err) {
        console.error('Error parsing token:', err);
        return;
      }

      try {
        const response = await fetch('/api/v1/users', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error fetching users');
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('An error occurred:', error);
      }
    };

    fetchUsers();
  }, [isAddModalOpen, isDeleteModalOpen]);

  return (
    <div className='p-4'>
      <button
        onClick={openAddModal}
        className='mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
      >
        Add User
      </button>
      <div className='grid grid-cols-3 gap-4'>
        {allUsers.length > 0 ? (
          allUsers.map((user) => (
            <button
              key={user.id}
              className='rounded-md border border-black border-1 p-2'
            >
              <h2 className='text-xl mb-2'>{user.username}</h2>
              <p>Role: {user.role}</p>
              <div
                onClick={() => openDeleteModal(user)}
                className='mt-2 px-2 py-1 text-white bg-red-500 rounded-md hover:bg-red-600'
              >
                Delete
              </div>
            </button>
          ))
        ) : (
          <p>No users found</p>
        )}
      </div>
      {isAddModalOpen && (
        <div
          onClick={closeAddModal}
          className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center'
        >
          <div className='bg-white p-4 rounded'>
            <AddUserModal closeModal={closeAddModal} />
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div
          onClick={closeDeleteModal}
          className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center'
        >
          <div className='bg-white p-4 rounded'>
            <DeleteUserModal
              closeModal={closeDeleteModal}
              selectedUser={selectedUser}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(UserManagement);
