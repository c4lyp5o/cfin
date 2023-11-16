const checkSession = async (request, reply, done) => {
  if (!request.session.authenticated) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
};

export default checkSession;
