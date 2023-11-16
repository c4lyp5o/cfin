import bcrypt from 'bcrypt';

import prisma from '../database/client.js';

const getAllUsers = async (request, reply) => {
  const users = await prisma.userConfig.findMany();
  reply.send(users);
};

const createUser = async (request, reply) => {
  const { username, password, role } = request.body;

  // Check if user already exists
  const existingUser = await prisma.userConfig.findUnique({
    where: { username },
  });

  if (existingUser) {
    reply.status(400).send({ error: 'Username already exists' });
    return;
  }

  // check if there are any users in the database
  const users = await prisma.userConfig.findMany();

  // If there are no users, make this user an admin
  const designatedRole = users.length === 0 ? 'admin' : role;

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.userConfig.create({
    data: {
      username,
      password: hashedPassword,
      role: designatedRole,
    },
  });

  reply.send(user);
};

const updateUser = async (request, reply) => {
  const user = await prisma.userConfig.update({
    where: { id: Number(request.params.id) },
    data: request.body,
  });
  reply.send(user);
};

const deleteUser = async (request, reply) => {
  const user = await prisma.userConfig.delete({
    where: { id: Number(request.params.id) },
  });
  reply.send(user);
};

export { getAllUsers, createUser, updateUser, deleteUser };
