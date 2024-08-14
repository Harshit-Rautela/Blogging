import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User} from '../models/Model.js';
import auth from '../middleware/Auth.js'
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET; 
// Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create a new user
    user = new User({
      name,
      email,
      passwordHash,
    });

    // Save the user to the database
    await user.save();

    // Generate a JWT token
    const payload = { userId: user.id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // The server sends the generated JWT token back to the client in the response
    res.status(201).json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
  // Login a user
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      // Check if password matches
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      // Generate a JWT token
      const payload = { userId: user._id };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  
      // Respond with the token
      res.json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

router.get('/me', auth, async (req, res) => {
  try {
    // Get the user's data except for the passwordHash
    const user = await User.findById(req.user).select('-passwordHash');
    //this user now contains name and email which is sent as JSON to frontend.
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

  export default router;