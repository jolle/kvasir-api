import { Request, Response } from 'express';
import { State } from '../../State';
import { getSPInstance } from '../../apis/sharepoint';
import { isValidCourseId } from '../../Validators';

const reverseFullName = (name: string) => {
  const pieces = name.split(' ');

  return `${pieces.pop()}, ${pieces.join(' ')}`;
};

export default (state: State) => async (
  req: Request<{ id: string }>,
  res: Response
) => {
  if (!isValidCourseId(req.params.id)) {
    return res.status(400).send({
      error: 'The course ID is invalid.',
    });
  }

  const stateKey = `course-v3:${req.params.id}`;

  const cachedValue = await state.get(stateKey);
  if (cachedValue) {
    return res.contentType('json').send(cachedValue);
  }

  const spApi = await getSPInstance(state);
  const searchResults = await spApi.searchPeople(
    `RessL "${req.params.id.replace('-', '.')}"`
  );

  const people = searchResults
    .filter(({ JobTitle }) => JobTitle === 'Oppilas')
    .map(({ PreferredName, AccountName }) => ({
      name: reverseFullName(PreferredName),
      id: AccountName.split('|').pop(),
    }));

  await state.set(stateKey, JSON.stringify(people), 4 * 60 * 60);

  res.send(people);
};
