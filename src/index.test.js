const onPreBuild = require('./index').onPreBuild;

describe('onPreBuild', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  describe('when EJSON_PRIVATE_KEY environment variable is missing', () => {
    it('returns error', async () => {
      await onPreBuild({ inputs: {} });

      expect(process.env.MY_SECRET).toBeUndefined();
    });
  });

  // describe('with suffix context prefix ENV overrides', () => {
  //   it('sets ENV vars to the correct values', async () => {
  //     process.env.DATABASE_URL = 'https://dev.com';
  //     process.env.DATABASE_URL_STAGING = 'https://stage.com';
  //     process.env.CONTEXT = 'staging';
  //     await onPreBuild({ inputs: { mode: 'suffix' } });

  //     expect(process.env.DATABASE_URL).toBe(process.env.DATABASE_URL_STAGING);
  //   });
  // });

  // describe('with branch ENV overrides', () => {
  //   it('sets ENV vars to the correct values', async () => {
  //     process.env.DATABASE_URL = 'https://dev.com';
  //     process.env.HELLO_DATABASE_URL = 'https://stage.com';
  //     process.env.BRANCH = 'hello';
  //     await onPreBuild({ inputs: { mode: 'prefix' } });

  //     expect(process.env.DATABASE_URL).toBe(process.env.HELLO_DATABASE_URL);
  //   });
  // });

  // describe('with suffix branch ENV overrides', () => {
  //   it('sets ENV vars to the correct values', async () => {
  //     process.env.DATABASE_URL = 'https://dev.com';
  //     process.env.DATABASE_URL_HELLO = 'https://stage.com';
  //     process.env.BRANCH = 'hello';
  //     await onPreBuild({ inputs: { mode: 'suffix' } });

  //     expect(process.env.DATABASE_URL).toBe(process.env.DATABASE_URL_HELLO);
  //   });
  // });

  // describe('without ENV overrides', () => {
  //   it('does not change ENV vars', async () => {
  //     process.env.DATABASE_URL = 'https://dev.com';
  //     process.env.DATABASE_URL_HELLO = 'https://dontsetme.com';
  //     process.env.BRANCH = 'hello';
  //     await onPreBuild({ inputs: { mode: 'suffix' } });

  //     expect(process.env.DATABASE_URL).toBe(process.env.DATABASE_URL_HELLO);
  //   });
  // });
});