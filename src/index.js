const { promises: fs, constants } = require("fs");
const util = require('util');
const exec = util.promisify(require("child_process").exec);

module.exports = {
  async onPreBuild({
    inputs: { ejsonPrivateKeyEnvVarName, ejsonSecretsFilePath }, utils
  }) {
    const privateKey = process.env[ejsonPrivateKeyEnvVarName];
    const command = `echo ${privateKey} | ejson decrypt --key-from-stdin ${ejsonSecretsFilePath}`;

    if ( typeof privateKey === 'undefined') {
      return utils.build.failBuild(
        `The ${ejsonPrivateKeyEnvVarName} environment variable is not set`
      );
    }

    try {
      await fs.access(ejsonSecretsFilePath, constants.F_OK);
    } catch {
      return utils.build.failBuild(
        `The ${ejsonSecretsFilePath} file does not exist`
      );
    }

    let envVars;

    // Decrypt and extract environment variables from EJSON file
    try {
      const { stdout } = await exec(command);
      envVars = JSON.parse(stdout)["environment"] || {}
    } catch(err) {
      return utils.build.failBuild(
        err.stderr
      );
    }

    // Populate environment variables
    try {
      Object.keys(envVars).forEach(key => {
        console.log(`Populate environment variable ${key}`)
        process.env[key] = envVars[key]
      })
    } catch {
      return utils.build.failBuild(
        err.stderr
      );
    }
  }
}