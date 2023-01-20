const fs = require("fs");
const process = require("process");
const path = require("path");
const setupTray = require("./tray");
const setupHotkeys = require("./hotkeys");

(async () => {
  await setupTray(setupHotkeys);
})().catch((e) => console.error("[top][error]", e));

process.on("uncaughtException", (error, source) => {
  fs.writeFileSync(
    path.join(process.cwd(), "out2"),
    JSON.stringify({
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack?.toString(),
      source,
    })
  );
});
