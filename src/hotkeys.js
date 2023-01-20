const process = require("process");
const fs = require("fs");
const path = require("path");
const getActiveWindow = require("active-win");
const copyExe = require("./copy-exe");
const OBSWebSocket = require("obs-websocket-js").default;
const GlobalKeyboardListener =
  require("node-global-key-listener").GlobalKeyboardListener;

const obs = new OBSWebSocket();

module.exports = async function setupTray({ systray, config, itemStatus }) {
  console.info("[keys][start]");
  const bound = config.binding.map((k) => k.toUpperCase());
  itemStatus.title = config.error
    ? `No config found: ${configPath} (${config.error})`
    : bound.join(" + ");
  systray.sendAction({
    type: "update-item",
    item: itemStatus,
  });
  try {
    console.info("start copy");
    const serverPath = await copyExe();
    console.info("path", serverPath);
    const keys = new GlobalKeyboardListener({
      windows: {
        serverPath,
      },
    });

    keys.addListener(async (e, down) => {
      if (
        bound.includes(e.name) &&
        e.state === "DOWN" &&
        bound.every((k) => down[k]) &&
        bound.length === Object.values(down).filter(Boolean).length
      ) {
        console.info("[obs][connect]", config);
        await obs.connect(config.obs.uri, config.obs.password, {
          rpcVersion: 1,
        });
        console.info("[obs][connected]");
        const window = await getActiveWindow();
        console.info("[obs][window]", window);
        const windowPath = window.owner.path;
        const exe = path.basename(windowPath);
        console.info(
          "[obs][input]",
          `${window.title}:Chrome_WidgetWin_1:${exe}`
        );
        await obs.call("SetInputSettings", {
          inputName: config.inputName,
          inputSettings: {
            window: `${window.title}:Chrome_WidgetWin_1:${exe}`,
          },
          overlay: true,
        });
        console.info("[obs][done]");
        await obs.disconnect();
        console.info("[obs][disconnect]");
      }
    });
    console.info("[keys][end]");
  } catch (e) {
    fs.writeFileSync(path.join(process.cwd(), "out1"), e.toString());
    itemStatus.title = e.message;
    systray.sendAction({
      type: "update-item",
      item: itemStatus,
    });
  }
};
