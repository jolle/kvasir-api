require('dotenv').config();

import express from 'express';
import Memcached from 'memjs';
import routes from './routes';
import { State } from './State';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

const memcached = Memcached.Client.create(process.env.MEMCACHE_URL!, {
  username: process.env.MEMCACHE_USERNAME!,
  password: process.env.MEMCACHE_PASSWORD!
} as any);
const app = express();

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://kvasir.app'
        : /^http:\/\/localhost:/
  })
);

app.set('trust proxy', 1);
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 150
  })
);

app.use(routes(new State(memcached)));

app.use((_, res) => {
  res.status(404).send({ error: 'Not found' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
