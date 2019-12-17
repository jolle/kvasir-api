import { Request, Response } from 'express';

export default (
  cb: (req: Request & { fronterToken?: string }, res: Response) => any
) => (req: Request, res: Response) => {
  const { wcid } = req.query;

  if (!wcid) cb(req, res);

  cb(Object.assign(req, { fronterToken: wcid }), res);
};
