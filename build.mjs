import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('./', import.meta.url);
const policy = JSON.parse(await readFile(new URL('content/privacy-policy.json', root), 'utf8'));
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const contents = policy.sections.map(section => `<li><a href="#${escape(section.id)}">${escape(section.title)}</a></li>`).join('\n');
const sections = policy.sections.map(section => `<section id="${escape(section.id)}"><h2>${escape(section.title)}</h2>${section.paragraphs.map(text => `<p>${escape(text)}</p>`).join('\n')}</section>`).join('\n');
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Vidgets privacy policy: on-device widget content, photo permissions, optional sharing, support email, and data deletion.">
  <meta name="referrer" content="no-referrer">
  <title>Privacy Policy | Vidgets</title>
  <link rel="icon" type="image/svg+xml" href="assets/mark.svg">
  <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header"><div class="wrap header-inner">
    <a class="brand" href="index.html" aria-label="Vidgets home"><img src="assets/mark.svg" alt="" width="30" height="30">vidgets</a>
    <nav aria-label="Main navigation"><a href="support.html">Support</a><a href="privacy.html" aria-current="page">Privacy</a></nav>
  </div></header>
  <main id="main" class="wrap">
    <div class="page-title"><p class="eyebrow">Your space stays yours</p><h1>${escape(policy.title)}</h1><p class="meta">Updated ${escape(policy.updated)}</p><p class="lede">${escape(policy.introduction)}</p></div>
    <div class="document-grid">
      <aside class="contents" aria-label="On this page"><p>ON THIS PAGE</p><ol>${contents}</ol></aside>
      <article>
        ${sections}
        <section id="external-policies"><h2>External privacy statements</h2><p><a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">GitHub privacy statement</a> &middot; <a href="https://www.apple.com/legal/privacy/">Apple privacy policy</a></p><p><a class="button" href="mailto:admin@technoforbes.com?subject=Vidgets%20privacy%20request">Contact us about privacy</a></p></section>
      </article>
    </div>
  </main>
  <footer class="site-footer"><div class="wrap footer-inner"><p>Vidgets &middot; Widgets that work together.</p><nav aria-label="Footer"><a href="support.html">Support</a><a href="privacy.html">Privacy Policy</a></nav></div></footer>
</body>
</html>
`;
await writeFile(new URL('privacy.html', root), html);
console.log('Generated privacy.html from content/privacy-policy.json');
