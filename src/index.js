const { promises: fs, constants } = require("fs");
const util = require('util');
const exec = util.promisify(require("child_process").exec);

module.exports = {
  async onPreBuild({
    inputs: { ejsonPrivateKeyEnvVarName, ejsonSecretsFilePath }, utils: { build, run }
  }) {
    console.log("Installing ejson ...")
    const ejsonBinaryPath = "./bin/ejson";
    let downloadEJSON = false;

    try {
      await fs.access(ejsonBinaryPath, constants.F_OK);
    } catch {
      downloadEJSON = true;
    }

    if (downloadEJSON) {
      let arch = process.arch;
      if (arch === "x64") {
        arch = "amd64";
      }
      const downloadURL = `https://github.com/Shopify/ejson/releases/download/v1.3.0/${process.platform}-${process.arch}`
      try {
        await run("curl", ["-sL", `-o${ejsonBinaryPath}`, downloadURL]);
        await run("chmod", ["+x", ejsonBinaryPath]);
      } catch(err) {
        console.log(err)
        // return build.failBuild(err);
      }
    }

    const privateKey = process.env[ejsonPrivateKeyEnvVarName];
    const command = `echo ${privateKey} | ${ejsonBinaryPath} decrypt --key-from-stdin ${ejsonSecretsFilePath}`;

    if ( typeof privateKey === 'undefined') {
      return build.failBuild(
        `The ${ejsonPrivateKeyEnvVarName} environment variable is not set`
      );
    }

    try {
      await fs.access(ejsonSecretsFilePath, constants.F_OK);
    } catch {
      return build.failBuild(
        `The ${ejsonSecretsFilePath} file does not exist`
      );
    }

    let envVars;

    // Decrypt and extract environment variables from EJSON file
    try {
      // NOTE: I avoid using the Netlify's utils.run()
      // because I don't want to display the stdout
      // Ref: https://github.com/netlify/build/blob/main/packages/run-utils/src/main.js#L46g
      const { stdout } = await exec(command);
      envVars = JSON.parse(stdout)["environment"] || {}
    } catch(err) {
      return build.failBuild(
        err.stderr
      );
    }

    // Populate environment variables
    try {
      console.log("Populating environment variables ...")

      Object.keys(envVars).forEach(key => {
        console.log(`  * ${key}`);
        process.env[key] = envVars[key]
      })
    } catch {
      return build.failBuild(
        err.stderr
      );
    }
  }
}