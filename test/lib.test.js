const test = require('node:test');
const assert = require('node:assert');
const { clickAction, directImageUrl } = require('../src/lib.js');

const img = 'https://camo.githubusercontent.com/abc';

test('image links open the preview', () => {
  assert.equal(clickAction('https://github.com/user-attachments/assets/1234', img), 'preview');
  assert.equal(clickAction('https://example.com/shot.PNG', img), 'preview');
  assert.equal(clickAction('https://github.com/o/r/blob/main/docs/a.png', img), 'preview');
  assert.equal(clickAction(img, img), 'preview');
});

test('badges keep linking where they point', () => {
  assert.equal(clickAction('https://github.com/o/r/actions', img), null);
  assert.equal(clickAction('https://www.npmjs.com/package/x', img), 'new-tab');
});

test('text links: GitHub stays, everything else goes to a new tab', () => {
  assert.equal(clickAction('https://example.com/a.png', null), 'new-tab');
  assert.equal(clickAction('https://octocat.github.io/site', null), 'new-tab');
  assert.equal(clickAction('https://docs.github.com/en', null), null);
  assert.equal(clickAction('https://gist.github.com/o/1', null), null);
  assert.equal(clickAction('https://github.com/o/r/pull/1', null), null);
  assert.equal(clickAction('mailto:a@b.c', null), null);
  assert.equal(clickAction('javascript:void(0)', null), null);
});

test('blob links copy as raw', () => {
  assert.equal(directImageUrl('https://github.com/o/r/blob/main/a/b.png'), 'https://github.com/o/r/raw/main/a/b.png');
  assert.equal(directImageUrl('https://github.com/user-attachments/assets/1'), 'https://github.com/user-attachments/assets/1');
  assert.equal(directImageUrl('https://example.com/o/r/blob/x.png'), 'https://example.com/o/r/blob/x.png');
  assert.equal(
    directImageUrl('https://private-user-images.githubusercontent.com/39117631/665592735-cab85c90-b098-44e6-accd-9d35763ca258.png?jwt=x'),
    'https://github.com/user-attachments/assets/cab85c90-b098-44e6-accd-9d35763ca258',
  );
});
