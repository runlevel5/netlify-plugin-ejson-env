const onPreBuild = require('../src/index').onPreBuild;
const error = require("@netlify/build/src/plugins/error");
const run = require("@netlify/run-utils");

describe('onPreBuild', () => {
  const OLD_ENV = process.env;
  const utils = {
    run: run,
    build: {
      failBuild: error.failBuild
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

  describe('when private key environment variable is missing', () => {
    it('raises error', async () => {
      delete process.env.EJSON_PRIVATE_KEY

      try {
        await onPreBuild({ inputs: { ejsonPrivateKeyEnvVarName: "EJSON_PRIVATE_KEY" }, utils: utils });
      } catch(err) {
        expect(err).toEqual(new Error("The EJSON_PRIVATE_KEY environment variable is not set"));
      }
    });
  });

  describe('when secret EJSON file does not exist', () => {
    it('raises error', async () => {
      try {
        await onPreBuild({ inputs: { ejsonPrivateKeyEnvVarName: "EJSON_PRIVATE_KEY", ejsonSecretsFilePath: "./missingFile.ejson" }, utils: utils });
      } catch(err) {
        expect(err).toEqual(new Error("The ./missingFile.ejson file does not exist"));
      }
    });
  });

  it('decrypt EJSON file then populate environment variables', async () => {
    expect(process.env.MY_SECRET).toBeUndefined();
    await onPreBuild({ inputs: { ejsonPrivateKeyEnvVarName: "EJSON_PRIVATE_KEY", ejsonSecretsFilePath: "./secrets.ejson" }, utils: utils });
    expect(process.env.MY_SECRET).toBe("hello_world");
  });
});