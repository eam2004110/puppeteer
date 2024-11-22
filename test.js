(async () => {
  const isLocal = true;
  // await (
  //   await fetch(
  //     isLocal
  //       ? "http://localhost:4000/?url=https://pixabay.com/images/search/mountain sky/"
  //       : "https://puppeteer-xy1o.onrender.com/?url=https://pixabay.com/images/search/sky/"
  //   )
  // ).text();
  // setTimeout(async () => {
  const resp = await fetch(
    isLocal
      ? "http://localhost:4000/?url=https://pixabay.com/images/search/night/"
      : "https://puppeteer-xy1o.onrender.com/?url=https://pixabay.com/images/search/sky/"
  );
  const text = await resp.text();
  console.log(text);
  // });
})();
