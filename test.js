(async () => {
  const isLocal = true;

  const resp = await fetch(
    isLocal
      ? "http://localhost:4000/?url=https://pixabay.com/images/search/mountain/"
      : "https://puppeteer-xy1o.onrender.com/?url=https://pixabay.com/images/search/sky/"
  );
  const text = await resp.text();
  console.log(text);
})();
