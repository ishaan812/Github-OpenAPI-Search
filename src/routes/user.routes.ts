import { Router, Response } from 'express';

const router = Router();

router.get('/', (_req, _res): Response => {
  const users = ['Goon', 'Tsuki', 'Joe'];
  return _res.send(users);
});

export { router };
