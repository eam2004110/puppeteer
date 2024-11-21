(async () => {
  const resp = await fetch(
    "https://puppeteer-xy1o.onrender.com/?url=https://pixabay.com/images/search/sky/"
  );
  const text = await resp.text();
  console.log(text);
})();
