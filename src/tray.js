const os = require("os");
const process = require("process");
const fs = require("fs");
const { default: SysTray } = require("systray2");

const path = require("path");

const itemStatus = {
  title: "Starting...",
  tooltip: "bb",
  checked: false,
  enabled: true,
};

const itemExit = {
  title: "Exit",
  tooltip: "bb",
  checked: false,
  enabled: true,
  click: () => {
    systray.kill(true);
  },
};

const iconPath = path.resolve(
  __dirname,
  "..",
  "assets",
  os.platform() ? "icon.ico" : "icon.png"
);

const systray = new SysTray({
  menu: {
    icon: iconPath,
    isTemplateIcon: os.platform() === "darwin",
    title: "OBS Keybindings",
    tooltip: "OBS Keybindings",
    items: [
      itemStatus,
      SysTray.separator,
      // item2,
      itemExit,
    ],
  },
  debug: false,
  copyDir: process.argv[0].endsWith(".exe"),
});

systray.onClick((action) => {
  if (!!action.item.click) {
    action.item.click();
  }
});

async function getConfig() {
  let config = {
    obs: {
      uri: "ws://192.168.1.113:4455",
      password: "replace-me",
    },
    inputName: "Code Window",
    binding: ["LEFT CTRL", "LEFT SHIFT", "F"],
  };

  const configPath = path.join(process.cwd(), "config.json");

  try {
    config = JSON.parse(await fs.promises.readFile(configPath, "utf-8"));
  } catch (e) {
    config.error = e.message;
  }

  return config;
}

module.exports = async function setupTray(afterSetup) {
  await systray.ready();
  const config = await getConfig();

  afterSetup({ systray, config, itemStatus });
};
