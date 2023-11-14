import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import prisma from '../database/client.js';

const initialCheck = async (req, reply) => {
  const users = await prisma.userConfig.findMany();
  if (users.length === 0) {
    reply.send({ showRegistration: true });
  } else {
    reply.send({ showRegistration: false });
  }
};

const initialRegistration = async (request, reply) => {
  const { username, password } = request.body;

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.userConfig.create({
    data: {
      username,
      password: hashedPassword,
      role: 'admin',
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

export { initialCheck, initialRegistration, loginUser };
