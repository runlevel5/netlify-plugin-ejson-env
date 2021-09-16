const onPreBuild = require('./index').onPreBuild;

describe('onPreBuild', () => {
  const OLD_ENV = process.env;
  const utils = {
    build: {
      failBuild: () => { throw "utils.build.failBuild" }
    }
  }

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.EJSON_PRIVATE_KEY = "5b9b60e59127147ff8a7a74de8512d5c1b1321e2679294bfa84194bb911b2fa6";
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  describe('when private key environment variable is missing', async () => {
    it('raises error', async () => {
      delete process.env.EJSON_PRIVATE_KEY

      try {
        await onPreBuild({ inputs: { ejsonPrivateKeyEnvVarName: "EJSON_PRIVATE_KEY" }, utils: utils });
      } catch(err) {
        expect(err).toBe("utils.build.failBuild");
      }
    });
  });

  describe('when secret EJSON file does not exist', async () => {
    it('raises error', async () => {
      try {
        await onPreBuild({ inputs: { ejsonSecretsFilePath: "./missingFile.ejson" }, utils: utils });
      } catch(err) {
        expect(err).toBe("utils.build.failBuild");
      }
    });
  });

  it('decrypt EJSON file then populate environment variables', async () => {
    expect(process.env.MY_SECRET).toBeUndefined();
    await onPreBuild({ inputs: { ejsonPrivateKeyEnvVarName: "EJSON_PRIVATE_KEY", ejsonSecretsFilePath: "./secrets.ejson" }, utils: utils });
    expect(process.env.MY_SECRET).toBe("hello_world");
  });
});