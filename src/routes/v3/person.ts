import { Request, Response } from 'express';
import { State } from '../../State';
import { getDelveInstance } from '../../apis/delve';

export default (state: State) => async (req: Request, res: Response) => {
  const email = req.query.id;

  if (
    !email ||
    !email.endsWith('@edu.hel.fi') ||
    email.split('@')[0].length < 3 ||
    email.split('@')[0].length > 100
  ) {
    return res.status(400).send({
      error: 'The user ID is invalid.'
    });
  }

  const stateKey = `person-v2:${email}`;

  const cachedValue = await state.get(stateKey);
  if (cachedValue) {
    return res.contentType('json').send(cachedValue);
  }

  const delveApi = await getDelveInstance(state);
  let searchResult = await delveApi.getPerson(email).catch(() => undefined);

  if (
    !searchResult ||
    (searchResult as any).ErrorId ||
    !(searchResult as any).FullName
  ) {
    const pieces = (email.split('@')[0] || '').split('.');
    if (pieces.length !== 2)
      return res.status(404).send({
        error: 'Person not found'
      });
    searchResult = await delveApi
      .getPerson(pieces[1].slice(0, 4) + pieces[0].slice(0, 3) + '@edu.hel.fi')
      .catch(() => undefined);

    if (
      !searchResult ||
      (searchResult as any).ErrorId ||
      !(searchResult as any).FullName
    ) {
      return res.status(404).send({
        error: 'Person not found'
      });
    }
  }

  const courses = searchResult.OfficeLocation.split('>')[1]
    .split(',')
    .map((courseAbbreviation: string) => courseAbbreviation.replace(/\.+$/, ''))
    .filter((courseAbbreviation: string) => !courseAbbreviation.includes(' '));

  const person = {
    courses,
    partial: searchResult.OfficeLocation.endsWith('...'),
    name: (searchResult.FullName || '')
      .split(' ')
      .reverse()
      .join(', ')
  };

  await state.set(stateKey, JSON.stringify(person), 4 * 60 * 60);

  res.send(person);
};
