import fronterTokenWrapper from '../../../fronterTokenWrapper';
import { FronterAPICourse } from '../../../apis/fronter';
import { State } from '../../../State';

export default (state: State) =>
  fronterTokenWrapper(async (req, res) => {
    if (!req.fronterToken) {
      return res.status(403).send({
        error: 'Invalid Fronter token',
      });
    }

    if (
      !req.params.id ||
      typeof req.params.id !== 'string' ||
      req.params.id.length < 3 ||
      !/^[0-9]+$/.test(req.params.id)
    ) {
      return res.status(400).send({
        error: 'Invalid Fronter course ID',
      });
    }

    const cacheKey = `fronter:course:${req.params.id}`;

    const cached = await state.get(cacheKey);
    if (cached) return res.contentType('json').send(cached);

    const api = new FronterAPICourse(
      process.env.FRONTER_ENDPOINT!,
      req.fronterToken,
      req.params.id,
      ''
    );

    try {
      const users = (await api.getUsers()).map(({ id, name }) => ({
        id,
        name,
      }));

      state.set(cacheKey, JSON.stringify(users), 4 * 60 * 60);

      res.send(users);
    } catch (e) {
      return res.status(403).send({
        error: 'Expired Fronter token',
        action: 'reauth',
      });
    }
  });
