const fs = require("fs");
const os = require("os");
const path = require("path");

module.exports = async function copyExe() {
  // executable file name
  const executable = "WinKeyServer.exe";

  //file path to the asset executable file
  const remoteControlFilePath = path.join(
    __dirname,
    `../node_modules/node-global-key-listener/bin/${executable}`
  );

  console.info("[copyexe]");
  // creating a temporary folder for our executable file
  const destination = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
  console.info("[copyexe:2]", destination);
  const destinationPath = path.join(destination, executable);
  console.info("[copyexe:2]", destinationPath);
  // copy the executable file into the temporary folder
  fs.copyFileSync(remoteControlFilePath, destinationPath);
  console.info("[copyexe]", destinationPath);
  return destinationPath;
};
