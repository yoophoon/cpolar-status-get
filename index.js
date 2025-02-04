const puppeteer = require('puppeteer');
const fs = require("fs");

const loginSelector = '#site-header > div > div > div > header.elementor-element.elementor-element-73f40419.elementor-section-content-middle.elementor-section-stretched.elementor-section-boxed.elementor-section-height-default.elementor-section-height-default.elementor-section.elementor-top-section.elementor-sticky.elementor-sticky--effects.elementor-sticky--active.elementor-section--handles-inside > div > div > div.elementor-element.elementor-element-3b093c81.elementor-column.elementor-col-25.elementor-top-column > div > div > div > div > div > a';
const emailSelector = '#captcha-form > fieldset > div:nth-child(1) > div > div > input';
const text1Selector = '#dashboard > div > div:nth-child(2) > div.span9 > table > tbody > tr:nth-child(1) > th > a';
const text2Selector = '#dashboard > div > div:nth-child(2) > div.span9 > table > tbody > tr:nth-child(2) > th > a';
const text3Selector = '#dashboard > div > div:nth-child(2) > div.span9 > table > tbody > tr:nth-child(3) > th > a';
const statusSelector = '#get-started > div.row-fluid.get-started > div.left-nav.span3 > ul:nth-child(2) > li:nth-child(1) > a';

const isDebugger = false;

const start = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto('https://www.cpolar.com/', { timeout: 0 });
      const pageTarget = page.target();
      // 点击右上角登录按钮，selector错误的话可以重新获取替换
      await page.click(loginSelector)

      // 获取到点击登录按钮后的新tab页面
      const newTarget = await browser.waitForTarget(target => target.opener() === pageTarget);
      const newPage = await newTarget.page();
      await newPage.setViewport({ width: 1920, height: 1080 });
      // 等待登录页面#captcha-form存在
      await newPage.waitForSelector('#captcha-form');

      /* 进行登录操作 */
      console.log(process.env.CPOLAR_EMAIL + process.env.CPOLAR_PASSWORD);
      // 邮箱输入框输入，selector错误的话可以重新获取替换
      await newPage.type(emailSelector, process.env.CPOLAR_EMAIL, { delay: 100 });
      // 密码输入框输入，selector错误的话可以重新获取替换
      await newPage.type('#password', process.env.CPOLAR_PASSWORD, { delay: 100 });
      // 点击登录按钮
      await newPage.click('#loginBtn');

      // 等待状态页面#get-started存在 意味着首页加载完成
      await newPage.waitForSelector('#get-started');
      // 点击左边状态一栏
      await newPage.click(statusSelector);

      // 等待状态页面#dashboard存在 意味着状态页加载完成
      await newPage.waitForSelector('#dashboard');
      // 获取website以及ssh地址
      const text1 = await newPage.$eval(text1Selector, node => node.innerText)
      const text2 = await newPage.$eval(text2Selector, node => node.innerText)
      const text3 = await newPage.$eval(text3Selector, node => node.innerText)
      await browser.close();
      resolve({
        text1,
        text2,
        text3,
      });
    } catch (error) {
      reject(error);
    }
  })
}

start().then(res => {
  console.log('🦋🦋🦋🦋', res);
  let context = `
<html>
 <head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
 </head>
  <body>
    <p>${res.text1}</p>
    <p>${res.text2}</p>
    <p>${res.text3}</p>
  </body>
</html>
`;
  // 当前目录下创建index.html
  fs.writeFileSync("index.html", context, "utf8");
}).catch(err => {
  console.log('start err catch🐰:', err);
})
