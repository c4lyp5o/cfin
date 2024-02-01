import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import prisma from '../database/client.js';

const initialCheck = async (req, reply) => {
  try {
    const users = await prisma.userConfig.findMany();
    if (users.length === 0) {
      reply.send({ showRegistration: true });
    } else {
      reply.send({ showRegistration: false });
    }
  } catch (err) {
    reply.status(500).send({ message: err.message });
  }
};

const initialRegistration = async (request, reply) => {
  try {
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
  } catch (err) {
    reply.status(500).send({ message: err.message });
  }
};

const loginUser = async (request, reply) => {
  try {
    const { username, password } = request.body;

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

    // Create a session
    request.session.authenticated = true;
    request.session.user = {
      ...existingUser,
      uuid: uuidv4(),
    };

    reply.send({ message: 'Logged in successfully' });
  } catch (err) {
    reply.status(500).send({ message: err.message });
  }
};

export { initialCheck, initialRegistration, loginUser };
