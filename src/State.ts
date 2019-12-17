import Memcached from 'memjs';

export class State {
  private memcached: Memcached.Client;

  private promisified: {
    get: (key: string) => Promise<string | undefined>;
    set: (key: string, value: string, lifetime: number) => Promise<boolean>;
  };

  constructor(memcached: Memcached.Client) {
    this.memcached = memcached;

    this.promisified = {
      get: (key: string) =>
        memcached.get(key).then(({ value }) => (value as any) as string),
      set: (key: string, value: string, lifetime: number) =>
        memcached.set(key, value, {
          expires: lifetime
        })
    };
  }

  get(key: string) {
    return this.promisified.get(key);
  }

  set(key: string, value: string, lifetime: number) {
    return this.promisified.set(key, value, lifetime);
  }
}
