import puppeteer from "puppeteer";
import http from "http";

const PORT = process.env.PORT || 4000;
const ANTI_BOT_TITLES = process.env.ANTI_BOT_TITLES.split("|");
console.log(process.env.ANTI_BOT_TITLES, process.env.NODE_ENV);

let browser, page;
async function initPuppeteer() {
  try {
    if (!browser) {
      browser = await puppeteer.launch({
        args: [
          "--disable-setuid-sandbox",
          "--no-sandbox",
          "--single-process",
          "--no-zygote",
        ],
        executablePath:
          process.env.NODE_ENV == "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
      });
    }
    if (!page) {
      page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1024 });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
      );
    }
  } catch (e) {
    console.log(e.message);

    page = null;
  }
}
async function bypassAntiBot(url) {
  const title = await page.evaluate(
    () => document.querySelector("title")?.innerText || ""
  );
  const test = await page.evaluate(async (u) => {
    try {
      await fetch(u);
      await fetch(u);
      await fetch(u);
      await fetch(u);
      const resp = await fetch(u);
      const text = await resp.text();
      return text;
    } catch (e) {
      return e.message;
    }
  }, url);
  return test;
  if (ANTI_BOT_TITLES.includes(title)) {
    await page.close();
    page = null;
    await initPuppeteer();
    console.log(page, 43);
    await page.goto(url, { waitUntil: "domcontentloaded" });
    return await bypassAntiBot(url);
  } else {
    const html = await page.content();
    await page.close();
    page = null;
    return html;
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
      if (!browser || !page) await initPuppeteer();
      console.log(page, 76);
      await page.goto(url, { waitUntil: "domcontentloaded" });
      const html = await bypassAntiBot(url);
      // const html = await page.evaluate(async()=>{
      //   const resp=await fetch()
      // });

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
    }
    res.writeHead(504, { "Content-Type": "text/plain" });
    res.end(e.message);
  }
});

app.listen(PORT, () => console.log("Server running"));
