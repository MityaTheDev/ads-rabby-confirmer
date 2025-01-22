const logger = require("./src/logger");
const Ads = require("./src/AdsPower/index");
const BrowserAutomation = require(`./src/BrowserAutomation/puppeteer.js`);
const { pause, SECOND } = require("./src/time.js");
const PptrCfg = require("./configs/puppeteer.json");

(async () => {
  const ID = 152;
  const EXTENTION_URL = `acmacodkjbdgmoleebolmdjonilkdbch/notification.html#/approval`;
  let browserStatusBySN = await Ads.browserStatusBySN(ID);

  const CONFIRM_BTN_XPATH = `::-p-xpath(//button[.='Confirm'])`;
  const SIGN_BTN_XPATH = "::-p-xpath(//button[.='Sign' and not(@disabled)])";

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
  const browser = await BOT.browser;

  while (true) {
    await pause(200);
    let pages = await browser.pages();

    for await (let page of await pages) {
      let url = await page.url();

      if (url.includes(EXTENTION_URL)) {
        minimize(page);

        signButton = await waitForButton(SIGN_BTN_XPATH, 5000, page);
        if (signButton) {
          await BrowserAutomation.clickElementByConsole(page, signButton);
          await pause(200);
        }

        confirmButton = await waitForButton(CONFIRM_BTN_XPATH, 500, page);
        if (confirmButton) {
          await BrowserAutomation.clickElementByConsole(page, confirmButton);
        }
      }
    }
  }

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
    const session = await page.createCDPSession();
    const { windowId } = await session.send("Browser.getWindowForTarget");
    await session.send("Browser.setWindowBounds", {
      windowId,
      bounds: { windowState: "minimized" },
    });
  }

  function isClickable(elem) {}
})();
