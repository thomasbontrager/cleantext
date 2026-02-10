import { Router, Request, Response } from 'express';
import { signup, login, getUserById } from '../services/auth.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const result = await signup(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const result = await login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await getUserById(req.userId!);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
