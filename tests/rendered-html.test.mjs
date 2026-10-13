import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");

test("base book page keeps Mama Spasibo positioning", async () => {
  const page = await readFile(resolve(root, "app/page.tsx"), "utf8");
  const layout = await readFile(resolve(root, "app/layout.tsx"), "utf8");

  assert.match(layout, /Мама, спасибо/);
  assert.match(page, /chapters/);
  assert.match(page, /gallery/);
  assert.doesNotMatch(page, /29 990/);
});

test("premium React route uses separated demo data", async () => {
  const page = await readFile(resolve(root, "app/premium/page.tsx"), "utf8");
  const types = await readFile(resolve(root, "lib/premium/types.ts"), "utf8");
  const data = await readFile(resolve(root, "lib/premium/sokolov-demo.ts"), "utf8");
  const component = await readFile(
    resolve(root, "components/premium/PremiumBook.tsx"),
    "utf8",
  );

  assert.match(page, /PremiumBook/);
  assert.match(page, /sokolovDemoBook/);
  assert.match(types, /export interface PremiumBook/);
  assert.match(data, /createSokolovDemo/);
  assert.match(data, /Девочка, которая собирала лето/);
  assert.match(component, /book\.chapters/);
  assert.match(component, /book\.photos/);
  assert.match(component, /book\.voices/);
  assert.match(component, /book\.letters/);
  assert.match(component, /Пример размещения видео/);
});
