const ICON = {
  image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
};

const svg = (paths) =>
  `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const copyButton = (action, label, icon) => `
  <button type="button" data-action="${action}" data-label="${label}" aria-label="${label}" title="${label}">
    <span data-for="idle">${svg(icon)}</span>
    <span data-for="done">${svg(ICON.check)}</span>
    <span data-for="fail">${svg(ICON.alert)}</span>
  </button>`;

const CSS = `
dialog {
  position: fixed; inset: 0; box-sizing: border-box;
  width: 100vw; height: 100dvh; max-width: none; max-height: none;
  margin: 0; padding: 72px 32px 32px; border: 0;
  background: oklch(0 0 0 / 0.8); color: white;
  place-items: center;
  opacity: 0;
  transition: opacity 200ms ease-out, overlay 200ms ease-out allow-discrete, display 200ms ease-out allow-discrete;
}
dialog[open] { display: grid; opacity: 1; }
@starting-style { dialog[open] { opacity: 0; } }

dialog::backdrop { background: transparent; }

img {
  max-width: 100%; max-height: 100%; object-fit: contain;
  border-radius: 8px;
  outline: 1px solid oklch(1 0 0 / 0.1); outline-offset: -1px;
  transition-property: scale, translate; transition-duration: 200ms; transition-timing-function: ease-out;
}
@starting-style { dialog[open] img { scale: 0.96; } }
dialog:not([open]) img { translate: 0 8px; }

.toolbar {
  position: fixed; top: 16px; right: 16px;
  display: flex; align-items: center; gap: 2px;
  padding: 4px; border-radius: 12px;
  background: oklch(0.21 0 0 / 0.92);
  box-shadow: 0 0 0 1px oklch(1 0 0 / 0.08), 0 8px 24px oklch(0 0 0 / 0.4);
}
button, a {
  all: unset; box-sizing: border-box;
  display: grid; place-items: center;
  width: 32px; height: 32px; border-radius: 8px;
  color: oklch(1 0 0 / 0.72); cursor: pointer;
  transition-property: background-color, color, scale; transition-duration: 150ms; transition-timing-function: ease-out;
}
:is(button, a):hover { background-color: oklch(1 0 0 / 0.1); color: oklch(1 0 0); }
:is(button, a):active { scale: 0.96; }
:is(button, a):focus-visible { outline: 2px solid oklch(0.7 0.15 250); outline-offset: 1px; }
button[data-state="done"] { color: oklch(0.8 0.17 150); }
button[data-state="fail"] { color: oklch(0.75 0.17 25); }

[data-for] {
  grid-area: 1 / 1; display: grid;
  opacity: 0; scale: 0.25; filter: blur(4px);
  transition-property: opacity, scale, filter; transition-duration: 300ms; transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
}
button:not([data-state]) [data-for="idle"],
button[data-state="done"] [data-for="done"],
button[data-state="fail"] [data-for="fail"] { opacity: 1; scale: 1; filter: blur(0px); }

hr { width: 1px; height: 16px; margin: 0 4px; border: 0; background: oklch(1 0 0 / 0.12); }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0s !important; }
}`;

let ui;
let pageOverflow = '';

function getUi() {
  if (ui) {
    // GitHub swaps <body> on navigation, so the host lives on <html> and is re-attached if dropped.
    if (!ui.host.isConnected) document.documentElement.append(ui.host);
    return ui;
  }
  const host = document.createElement('stayput-preview');
  const root = host.attachShadow({ mode: 'closed' });
  // Constructed sheets aren't subject to GitHub's style-src CSP.
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(CSS);
  root.adoptedStyleSheets = [sheet];
  root.innerHTML = `
    <dialog aria-label="Image preview">
      <div class="toolbar">
        ${copyButton('copy-image', 'Copy image', ICON.image)}
        ${copyButton('copy-url', 'Copy image URL', ICON.link)}
        <a data-action="open" target="_blank" rel="noopener" aria-label="Open original in new tab" title="Open original in new tab">${svg(ICON.external)}</a>
        <hr>
        <button type="button" data-action="close" aria-label="Close" title="Close (Esc)" autofocus>${svg(ICON.close)}</button>
      </div>
      <img alt="">
      <span class="sr-only" role="status"></span>
    </dialog>`;
  ui = {
    host,
    dialog: root.querySelector('dialog'),
    img: root.querySelector('img'),
    open: root.querySelector('[data-action="open"]'),
    status: root.querySelector('[role="status"]'),
  };

  ui.dialog.addEventListener('click', (e) => {
    if (e.target === ui.dialog) return ui.dialog.close();
    const button = e.target.closest('button[data-action]');
    if (button?.dataset.action === 'close') ui.dialog.close();
    // Both writes start synchronously inside the click so the user activation still counts.
    if (button?.dataset.action === 'copy-image') {
      report(button, navigator.clipboard.write([new ClipboardItem({ 'image/png': fetchPng(ui.img.src) })]), 'Image copied');
    }
    if (button?.dataset.action === 'copy-url') {
      report(button, navigator.clipboard.writeText(ui.open.href), 'Image URL copied');
    }
  });
  ui.dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = pageOverflow;
    for (const button of ui.dialog.querySelectorAll('[data-state]')) reset(button);
  });

  document.documentElement.append(host);
  return ui;
}

function report(button, promise, message) {
  promise.then(
    () => setState(button, 'done', message),
    () => setState(button, 'fail', 'Copy failed'),
  );
}

function setState(button, state, message) {
  clearTimeout(button.resetTimer);
  button.dataset.state = state;
  button.ariaLabel = button.title = message;
  ui.status.textContent = message;
  button.resetTimer = setTimeout(() => reset(button), 1500);
}

function reset(button) {
  clearTimeout(button.resetTimer);
  delete button.dataset.state;
  button.ariaLabel = button.title = button.dataset.label;
}

async function fetchPng(url) {
  const { data, error } = await chrome.runtime.sendMessage({ type: 'copy-image', url });
  if (error) throw new Error(error);
  return new Blob([Uint8Array.from(atob(data), (c) => c.charCodeAt(0))], { type: 'image/png' });
}

function openPreview(img, link) {
  const { dialog, img: preview, open, status } = getUi();
  preview.src = img.currentSrc || img.src;
  preview.alt = img.alt;
  // Transparent images sit on the page color, the same as inline.
  preview.style.backgroundColor = getComputedStyle(document.body).backgroundColor;
  open.href = directImageUrl(link.href);
  status.textContent = '';
  pageOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = 'hidden';
  dialog.showModal();
}

document.addEventListener('click', (e) => {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !(e.target instanceof Element)) return;
  const link = e.target.closest('a[href]');
  if (!link) return;
  const img = e.target.closest('img');
  const action = clickAction(link.href, img?.src);
  if (action === 'new-tab') link.target = '_blank';
  if (action === 'preview') {
    e.preventDefault();
    e.stopImmediatePropagation();
    openPreview(img, link);
  }
}, true);
