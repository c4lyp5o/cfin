'use client';
import { useState, useEffect } from 'react';

import withAuth from '../../../hoc/withAuth';

function UserManagement() {
  const [allUsers, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('cfin');
    const user = JSON.parse(token);

    fetch('/api/v1/users', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
      });
  }, []);

  return (
    <div className='p-4'>
      {/* <h1 className='text-2xl mb-4'>User Management</h1> */}
      <div className='grid grid-cols-3 gap-4'>
        {allUsers.length > 0 ? (
          allUsers.map((user) => (
            <button key={user.id} className='border p-2'>
              <h2 className='text-xl mb-2'>{user.username}</h2>
              <p>{user.email}</p>
              <p>{user.role}</p>
            </button>
          ))
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  );
}

export default withAuth(UserManagement);
