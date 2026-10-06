// Fetches images for "Copy image". Runs here because host permissions skip the CORS
// checks that block the content script from reading camo and private image bytes.
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg?.type !== 'copy-image') return;
  toPngBase64(msg.url).then((data) => reply({ data }), (err) => reply({ error: String(err) }));
  return true;
});

async function toPngBase64(url) {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // ponytail: createImageBitmap can't decode SVG, so SVG copies fail; rasterize in an offscreen document if that matters.
  const bitmap = await createImageBitmap(await res.blob());
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  canvas.getContext('2d').drawImage(bitmap, 0, 0);
  const bytes = new Uint8Array(await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}
