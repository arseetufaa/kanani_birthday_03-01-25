const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Set viewport to match puzzle size
    await page.setViewport({ width: 300, height: 300 });
    
    // Load the puzzle HTML file
    await page.goto(`file://${path.join(__dirname, 'puzzle.html')}`);
    
    // Wait for the page to be fully loaded
    await page.waitForFunction(() => document.readyState === 'complete');
    // Additional wait to ensure animations are complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Capture the screenshot
    await page.screenshot({
        path: path.join(__dirname, 'puzzle.png'),
        type: 'png'
    });
    
    await browser.close();
    console.log('Puzzle image captured successfully!');
})();
