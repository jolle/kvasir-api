import { Request, Response } from 'express';
import { FronterAPI } from '../../../apis/fronter';

export default () => async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({ error: 'No username or password given' });
  }

  if (username.length < 3 || password.length < 3) {
    return res.status(400).send({ error: 'Invalid username or password' });
  }

  const fronter = new FronterAPI(process.env.FRONTER_ENDPOINT!);

  try {
    await fronter.login(username, password);
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: 'Invalid username or password' });
  }

  res.send({
    token: fronter.wcid,
  });
};
