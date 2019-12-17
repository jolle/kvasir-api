import { Router } from 'express';
import v3 from './v3';
import { State } from '../State';

export default (state: State) => {
  const router = Router();

  router.use('/v3', v3(state));

  return router;
};
