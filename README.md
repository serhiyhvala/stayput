# StayPut

Chrome/Arc extension for github.com:

- Click an image to open it in an in-page preview with buttons to copy the image, copy its URL, open the original, or close (Esc or a click outside also closes it).
- Links to other sites open in a new tab. GitHub links stay in the current tab.

Hold Cmd, Ctrl, Shift or Alt while clicking to skip both behaviors.

## Install

1. Open `chrome://extensions` (Arc: `arc://extensions`) and turn on Developer mode.
2. Click **Load unpacked** and select the `src` folder.

## Scripts

- `pnpm test` runs the link rules tests.
- `pnpm zip` builds `stayput.zip` from `src`.
