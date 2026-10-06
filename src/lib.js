// Pure URL logic. Loaded as a classic content script before content.js, and required by the tests.

const IMAGE_HOSTS = new Set([
  'user-images.githubusercontent.com',
  'private-user-images.githubusercontent.com',
  'camo.githubusercontent.com',
]);
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg|bmp|ico)$/i;

function parseHttp(href) {
  try {
    const url = new URL(href);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
}

const isGitHub = (hostname) => hostname === 'github.com' || hostname.endsWith('.github.com');

// 'preview' for a link that wraps the clicked image and points at an image,
// 'new-tab' for any link off GitHub (including *.github.io Pages sites), null to leave the click alone.
// Badges that link to CI pages fall through, so they keep working as links.
function clickAction(href, imgSrc) {
  const url = parseHttp(href);
  if (!url) return null;
  if (imgSrc && (href === imgSrc || IMAGE_HOSTS.has(url.hostname) ||
      url.pathname.includes('/user-attachments/assets/') || IMAGE_EXT.test(url.pathname))) {
    return 'preview';
  }
  return isGitHub(url.hostname) ? null : 'new-tab';
}

// A URL worth sharing: repo images link to their blob page (use raw), and attachment
// links are signed URLs that expire in minutes (use the stable user-attachments URL).
function directImageUrl(href) {
  const url = parseHttp(href);
  if (!url) return href;
  const asset = url.hostname === 'private-user-images.githubusercontent.com' &&
    url.pathname.match(/-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.\w+$/);
  if (asset) return `https://github.com/user-attachments/assets/${asset[1]}`;
  if (url.hostname === 'github.com') url.pathname = url.pathname.replace(/^(\/[^/]+\/[^/]+)\/blob\//, '$1/raw/');
  return url.href;
}

if (typeof module !== 'undefined') module.exports = { clickAction, directImageUrl };
