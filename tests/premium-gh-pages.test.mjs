import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { spawn } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const outDir = resolve(root, "gh-pages");

async function buildGhPages() {
  await new Promise((resolvePromise, reject) => {
    const child = spawn("node", ["scripts/build-gh-pages.mjs"], {
      cwd: root,
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`build:gh-pages exited with ${code}`));
    });
  });
}

test("premium GitHub Pages build includes full book surface", async () => {
  await buildGhPages();

  const html = await readFile(resolve(outDir, "premium/index.html"), "utf8");
  const styles = await readFile(resolve(outDir, "premium/styles.css"), "utf8");
  const data = await readFile(resolve(outDir, "premium/js/data.js"), "utf8");
  const bookJs = await readFile(resolve(outDir, "premium/js/book.js"), "utf8");

  assert.match(html, /Мамина история/);
  assert.match(html, /Елена Соколова|data-bind="cover.recipientName"/);
  assert.match(html, /og:image/);
  assert.match(html, /#dedication/);
  assert.match(html, /#chapters/);
  assert.match(html, /#photos/);
  assert.match(html, /#videos/);
  assert.match(html, /#voices/);
  assert.match(html, /#letters/);
  assert.match(html, /#order/);
  assert.match(html, /\.\/styles\.css/);
  assert.match(html, /\.\/js\/book\.js/);

  assert.match(styles, /--paper:\s*#f8f3ea/i);
  assert.match(styles, /prefers-reduced-motion/);

  assert.match(data, /Девочка, которая собирала лето/);
  assert.match(data, /Восемнадцать\. Мир открыт/);
  assert.match(data, /Время выбирать себя/);
  assert.match(data, /Одна случайная встреча/);
  assert.match(data, /Дом, который мы построили/);
  assert.match(data, /Ника, Миша и тысяча первых раз/);
  assert.match(data, /Самые лучшие главы ещё впереди/);
  assert.match(data, /29 990/);
  assert.match(data, /t\.me\/keepitok/);

  assert.match(bookJs, /initChapters/);
  assert.match(bookJs, /initGallery/);
  assert.match(bookJs, /initVoices/);
  assert.match(bookJs, /initVideos/);
  assert.match(bookJs, /initLetters/);
  assert.match(bookJs, /Пример размещения видео/);

  const gallery = await readdir(resolve(outDir, "assets/gallery"));
  for (let i = 1; i <= 12; i += 1) {
    assert.ok(gallery.includes(`mom-${String(i).padStart(2, "0")}.jpg`));
  }

  await access(resolve(outDir, "assets/media/voice-nika.wav"));
  await access(resolve(outDir, "assets/media/voice-misha.wav"));
  await access(resolve(outDir, "assets/media/voice-andrey.wav"));
  await access(resolve(outDir, "assets/mamina-istoriya-hero.png"));
  await access(resolve(outDir, "index.html"));
});

test("premium demo data exposes twelve photos and seven chapters", async () => {
  const { createSokolovDemo } = await import(
    resolve(root, "premium/js/data.js")
  );
  const book = createSokolovDemo("../assets");
  assert.equal(book.chapters.length, 7);
  assert.equal(book.photos.length, 12);
  assert.equal(book.voices.length, 3);
  assert.equal(book.letters.length, 3);
  assert.equal(book.videos.length, 4);
  assert.ok(book.voices.every((voice) => voice.src));
  assert.ok(book.videos.every((video) => !video.src));
  assert.match(book.commercial.ctaHref, /^https:\/\/t\.me\/keepitok/);
});
