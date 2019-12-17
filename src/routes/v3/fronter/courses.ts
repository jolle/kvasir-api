import { FronterAPI } from './../../../apis/fronter';
import { State } from './../../../State';
import fronterTokenWrapper from '../../../fronterTokenWrapper';

export default (state: State) =>
  fronterTokenWrapper(async (req, res) => {
    if (!req.fronterToken) {
      return res.status(403).send({
        error: 'Invalid Fronter token',
      });
    }

    const cacheKey = `fronter:courses:${req.fronterToken}`;

    const cached = await state.get(cacheKey);
    if (cached) return res.contentType('json').send(cached);

    const fronter = new FronterAPI(
      process.env.FRONTER_ENDPOINT!,
      req.fronterToken
    );

    try {
      const courses = (await fronter.getCourses()).map(({ name, id }) => ({
        name,
        id,
      }));

      if (courses.length === 0) {
        return res.status(403).send({
          error: 'Expired Fronter token',
          action: 'reauth',
        });
      }

      state.set(cacheKey, JSON.stringify(courses), 4 * 60 * 60);

      res.send(courses);
    } catch (e) {
      console.error('Fronter error:', e);

      res.status(403).send({
        error: 'Expired Fronter token',
        action: 'reauth',
      });
    }
  });
