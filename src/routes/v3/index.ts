import { Router, Response } from 'express';
import course from './course';
import { State } from '../../State';
import person from './person';
import bodyParser from 'body-parser';
import status from './status';

const notAvailableStub = (_: any, res: Response) => {
  res.status(503).send({ error: 'Service not available' });
};

export default (state: State) => {
  const router = Router();

  router.use(bodyParser.json());

  router.get('/course/:id', course(state));
  router.get('/person', person(state));
  router.post('/fronter/createToken', notAvailableStub);
  router.get('/fronter/courses', notAvailableStub);
  router.get('/fronter/courses/:id', notAvailableStub);
  router.get('/status', status(state));

  return router;
};
