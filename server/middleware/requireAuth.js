import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authorization.slice('Bearer '.length).trim();

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(userId).select('_id username email');

    // Valid signature but the user no longer exists (e.g. account deleted)
    if (!user) {
      return res.status(401).json({ error: 'Request is not authorized' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

export default requireAuth;
