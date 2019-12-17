import { Request, Response } from 'express';
import { State } from '../../State';

export default (state: State) => async (
  _: Request<{ id: string }>,
  res: Response
) => {
  const maintenance = await state.get('maintenance');

  if (!maintenance) return res.send({});

  res.send(JSON.parse(maintenance || '{}'));
};
