import puppeteer from "puppeteer";
import http from "http";

const PORT = process.env.PORT || 4000;
let browser, page;
let isLaunched = false;
let isPageOpened = false;
async function initPuppeteer() {
  try {
    if (!isLaunched) {
      browser = await puppeteer.launch({
        args: [
          "--disable-setuid-sandbox",
          "--no-sandbox",
          "--single-process",
          "--no-zygote",
        ],
        executablePath:
          process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
      });
      isLaunched = true;
    }
    if (!isPageOpened) {
      page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1024 });
      isPageOpened = true;
    }
  } catch {
    isLaunched = false;
    isPageOpened = false;
  }
}
const app = http.createServer(async (req, res) => {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") {
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      res.writeHead(204);
      res.end();
      return;
    }
    if (req.url.startsWith("/?url=") && req.method === "GET") {
      res.setHeader(
        "Content-Security-Policy",
        `default-src 'self'; script-src 'self'; media-src *; img-src *; connect-src *`
      );
      const url = req.url.slice(6, req.url.length);
      if (!isLaunched || !isPageOpened) await initPuppeteer();
      await page.goto(url);
      const html = await page.evaluate(
        () => document.documentElement.outerHTML
      );
      await page.close();
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("bad request");
  } catch (e) {
    try {
      await page.close();
    } catch {
    } finally {
      page = null;
      isPageOpened = false;
    }
    res.writeHead(504, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: e }));
  }
});

app.listen(PORT, () => console.log("Server running"));
