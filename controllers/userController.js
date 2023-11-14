import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import prisma from '../database/client.js';

const getAllUsers = async (request, reply) => {
  const users = await prisma.userConfig.findMany();
  reply.send(users);
};

const createUser = async (request, reply) => {
  const { username, password } = request.body;

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
  const role = users.length === 0 ? 'admin' : 'user';

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.userConfig.create({
    data: {
      username,
      password: hashedPassword,
      role,
    },
  });

  reply.send(user);
};

const loginUser = async (request, reply) => {
  const { username, password } = request.body;

  console.log(process.env.JWT_SECRET);

  try {
    // Check if user exists
    const existingUser = await prisma.userConfig.findUnique({
      where: { username },
    });

    if (!existingUser) {
      reply.status(400).send({ message: 'Username does not exist' });
      return;
    }

    // Check if password is correct
    const validPassword = await bcrypt.compare(password, existingUser.password);

    if (!validPassword) {
      reply.status(400).send({ message: 'Invalid password' });
      return;
    }

    // Create and sign a JWT token
    const token = jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET);

    reply.send({ token, username: existingUser.username });
  } catch (err) {
    reply.status(500).send({ message: err.message });
  }
};

const validateUser = async (request, reply) => {
  const token = request.headers.authorization?.split(' ')[1];

  if (!token) {
    reply.status(400).send({ error: 'Token is required' });
    return;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    reply.send({ valid: true });
  } catch (err) {
    reply.status(401).send({ valid: false });
  }
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

export {
  getAllUsers,
  createUser,
  loginUser,
  validateUser,
  updateUser,
  deleteUser,
};
