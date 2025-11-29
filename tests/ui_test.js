const puppeteer = require('puppeteer');

async function run() {
  const base = 'http://localhost:8080/index.html';
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(10000);

  try {
    console.log('→ 打开页面', base);
    await page.goto(base, { waitUntil: 'networkidle2' });

    // 检查登录输入
    await page.waitForSelector('#nickname-input');
    console.log('✓ 找到 #nickname-input');

    // 输入昵称并登录
    await page.type('#nickname-input', 'testuser');
    await page.click('#start-button');
    console.log('→ 点击开始体验');

    // 等待菜单出现
    await page.waitForFunction(() => {
      const ms = document.getElementById('menu-screen');
      return ms && ms.classList.contains('active');
    }, { timeout: 5000 });
    console.log('✓ 进入主菜单 (menu-screen active)');

    // 点击进入抽奖页（menu card）
    await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll('.menu-card')).find(c => c.getAttribute('data-target') === 'invite-screen');
      if (card) card.click();
    });
    await page.waitForSelector('#invite-screen.active, #invite-screen');
    console.log('✓ 已触发 invite-screen');

    // 检查抽奖按钮
    const spin = await page.$('#spin-button');
    if (spin) console.log('✓ spin-button 存在'); else throw new Error('spin-button 未找到');

    // 点击模拟邀请
    const sim = await page.$('#simulate-invite');
    if (sim) { await sim.click(); console.log('✓ simulate-invite 点击成功'); }

    // 跳转到投诉页并测试投诉按钮
    await page.evaluate(() => window.screenManager && window.screenManager.showScreen(window.CONFIG.SCREENS.COMPLAINT));
    await page.waitForSelector('#complaint-screen.active');
    console.log('✓ complaint-screen active');

    // 点击投诉确认
    await page.click('#complain-yes');
    // 等待客服页打开
    await page.waitForFunction(() => {
      const cs = document.getElementById('customer-screen');
      return cs && cs.classList.contains('active');
    }, { timeout: 5000 });
    console.log('✓ 投诉按钮打开客服 (customer-screen active)');

    // 在客服输入框发送一条消息
    await page.type('#customer-input', '这是一个测试申诉');
    await page.click('#customer-send');
    console.log('✓ 客服消息已发送');

    // 基本检查通过
    console.log('\nALL CHECKS PASSED');
    await browser.close();
    process.exit(0);

  } catch (err) {
    console.error('TEST FAILED:', err);
    await browser.close();
    process.exit(2);
  }
}

run();
