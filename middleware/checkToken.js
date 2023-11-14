import jwt from 'jsonwebtoken';

const checkToken = async (request, reply) => {
  try {
    const authorization = request.headers.authorization;
    const token = authorization.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        throw new Error('Invalid token');
      }
      request.user = decoded;
    });
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
};

export default checkToken;
