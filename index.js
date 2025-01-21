const logger = require('./src/logger');
const Ads = require('./src/AdsPower/index');
const BrowserAutomation = require(`./src/BrowserAutomation/puppeteer.js`);
const {pause, SECOND} = require('./src/time.js');
const PptrCfg = require('./configs/puppeteer.json');

;(async () => {

  const ID = 19;
  const EXTENTION = `poimlnlllekbpniphmmobkldjolhmkpk`;
  let browserStatusBySN = await Ads.browserStatusBySN(ID);

  let isBroswerActive = 
    (browserStatusBySN && browserStatusBySN.status === "Active")
    ? true 
    : false;
  await pause(SECOND * 3);

  while (!isBroswerActive) {
    console.log(isBroswerActive);
    await Ads.browserOpenBySN(ID);
    browserStatusBySN = await Ads.browserStatusBySN(id);
    isBroswerActive = (browserStatusBySN && browserStatusBySN.status === "Active")
      ? true 
      : false;
    await pause(SECOND * 3);
  };

  logger.log(browserStatusBySN);

  const BOT = {};
  BOT._id = ID;
  PptrCfg.browserWSEndpoint = browserStatusBySN.ws.puppeteer;
  // PptrCfg.browserWSEndpoint = ws;
  
  await BrowserAutomation.CreateBrowser(BOT, PptrCfg);
  // return;
  const browser = await BOT.browser;
  // return;
  while (true) {

    let pages = await browser.pages();

    for await (let page of await pages) {
      let url = await page.url();
      if (url.includes(EXTENTION)) {
        await pause(500);
        let xPathObject = await BrowserAutomation.xPathExistObject(page, {
          "confirm": "//button[.='Confirm']",
          "sign": "//button[.='Sign']"
        });
        // logger.log(xPathObject);
        if (xPathObject.confirm) {
          await BrowserAutomation.clickElementByConsole(page, xPathObject.confirm);
          await pause(100);
          break;
        }

        if (xPathObject.sign) {
          await BrowserAutomation.clickElementByConsole(page, xPathObject.sign);
          await pause(100);
          break;
        }
        await pause(100);

      }
    };

    await pause(100);
  }

})();