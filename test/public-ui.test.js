import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(path, import.meta.url), "utf8");

test("six product cards contain their actions inside a single card", async () => {
  const html = await read("../public/index.html");
  const cards = [...html.matchAll(/<article class="product-entry">([\s\S]*?)<\/article>/g)].map(match => match[1]);
  assert.equal(cards.length, 6);
  for (const name of ["Guess The Flag","Memory Rush","Zrain Auth Starter","Zrain Monitor","Zrain UI","Zrain Links"]) {
    const matches = cards.filter(card => card.includes("<strong>" + name + "</strong>"));
    assert.equal(matches.length, 1, name);
  }
  for (const name of ["Guess The Flag","Memory Rush","Zrain Auth Starter","Zrain UI"]) {
    const card = cards.find(item => item.includes("<strong>" + name + "</strong>"));
    assert.match(card, /class="product-actions"/);
    assert.match(card, /product-action-primary/);
    assert.match(card, /product-action-secondary/);
  }
  assert.doesNotMatch(html, /product-secondary-link/);
  assert.doesNotMatch(html, /product-directory\.js/);
});

test("public directory keeps three categories and honest on-demand language", async () => {
  const [html, css] = await Promise.all([read("../public/index.html"),read("../public/style.css")]);
  assert.equal((html.match(/class="bento-card /g) || []).length, 4);
  assert.match(html,/USEFUL WHEN NEEDED/);
  assert.match(html,/Open these services whenever you need them/);
  assert.doesNotMatch(html,/EVERYDAY USE|id="web-utilities"/);
  assert.match(css,/\.product-entry\{display:grid/);
  assert.match(css,/\.product-actions\{display:flex/);
});

test("UI showcase displays exact named HEX values for every swatch", async () => {
  const html = await read("../public/zrain-ui-showcase.html");
  const expected = [
    ["Warm Surface","#FFFAF6"],
    ["Deep Navy","#172433"],
    ["Terracotta","#B95136"],
    ["Soft Mint","#E6F1EC"]
  ];
  for (const [name,code] of expected) {
    assert.ok(html.includes("<strong>" + name + "</strong><code>" + code + "</code>"));
  }
  assert.equal((html.match(/class="swatch-item"/g) || []).length, 4);
});

test("game actions remain accessible through Zrain Console and Google Play", async () => {
  const html = await read("../public/index.html");
  for (const [slug,packageId] of [
    ["guess-the-flag","com.zrain.guesstheflag"],
    ["memory-rush","com.zrain.memoryrush"]
  ]) {
    assert.match(html,new RegExp('data-console="' + slug + '"'));
    assert.ok(html.includes("details?id=" + packageId));
  }
});
