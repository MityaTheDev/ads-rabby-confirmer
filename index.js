const Ads = require("./src/AdsPower/index");
const BrowserAutomation = require(`./src/BrowserAutomation/puppeteer.js`);
const { pause, SECOND } = require("./src/time.js");
const PptrCfg = require("./configs/puppeteer.json");

const CONFIRM_BTN_XPATH = `::-p-xpath(//button[.='Confirm'])`;
const SIGN_BTN_XPATH = `::-p-xpath(//button[.='Sign' and not(@disabled)])`;
const EXTENTION_URL = `chrome-extension://acmacodkjbdgmoleebolmdjonilkdbch/notification`;
const ID = 152;

const minimizedWidth = 398;
let intervalID;

const signWaitTime = 10000;
const confirmWaitTime = 500;

(async () => {
  const browser = await getBrowser();

  //when a new page is created, check if it is the extension page
  browser.on("targetcreated", async (target) => {
    const newPage = await target.page();
    if (newPage) {
      const url = newPage.url();
      if (url.includes(EXTENTION_URL)) {
        await minimize(newPage);
        await click(newPage);

        intervalID = setInterval(async () => {
          await checkWindowSizeAndMinimize(newPage);
        }, 300);
      }
    }
  });
})();

async function waitForButton(buttonXPath, timeout, page) {
  if (buttonXPath !== CONFIRM_BTN_XPATH && buttonXPath !== SIGN_BTN_XPATH) {
    console.error(
      "waitForButton(button, timeout) can not accept this as first arg: ",
      buttonXPath
    );
    return false;
  }

  let result = false;
  try {
    result = await page.waitForSelector(buttonXPath, {
      timeout: timeout,
    });
  } catch (error) {
    console.log(error.name);
  }

  return result;
}

async function minimize(page) {
  try {
    const session = await page.createCDPSession();
    const { windowId } = await session.send("Browser.getWindowForTarget");
    await session.send("Browser.setWindowBounds", {
      windowId,
      bounds: { windowState: "minimized" },
    });
  } catch (error) {
    // console.log(error.name);
  }
}

async function click(page) {
  signButton = await waitForButton(SIGN_BTN_XPATH, signWaitTime, page);
  if (signButton) {
    await BrowserAutomation.clickElementByConsole(page, signButton);
    await pause(200);
  }

  confirmButton = await waitForButton(CONFIRM_BTN_XPATH, confirmWaitTime, page);
  if (confirmButton) {
    await BrowserAutomation.clickElementByConsole(page, confirmButton);
  }

  await pause(200);
}

async function getBrowser() {
  let browserStatusBySN = await Ads.browserStatusBySN(ID);

  let isBroswerActive =
    browserStatusBySN && browserStatusBySN.status === "Active" ? true : false;
  await pause(SECOND * 3);

  while (!isBroswerActive) {
    console.log(isBroswerActive);
    await Ads.browserOpenBySN(ID);
    browserStatusBySN = await Ads.browserStatusBySN(id);
    isBroswerActive =
      browserStatusBySN && browserStatusBySN.status === "Active" ? true : false;
    await pause(SECOND * 3);
  }

  const BOT = {};
  BOT._id = ID;
  PptrCfg.browserWSEndpoint = browserStatusBySN.ws.puppeteer;
  // PptrCfg.browserWSEndpoint = ws;

  await BrowserAutomation.CreateBrowser(BOT, PptrCfg);
  return await BOT.browser;
}

const getWindowBounds = async (session) => {
  const { windowId } = await session.send("Browser.getWindowForTarget");
  const { bounds } = await session.send("Browser.getWindowBounds", {
    windowId,
  });
  return bounds;
};

const checkWindowSizeAndMinimize = async (page) => {
  try {
    console.log("Checking if window is maximized...");
    const session = await page.createCDPSession();
    const currentBounds = await getWindowBounds(session);

    if (currentBounds.width !== minimizedWidth) {
      await minimize(page);
    }
  } catch (error) {
    // console.log(error.name, "clearing interval...");
    //stop interval
    clearInterval(intervalID);
  }
};
