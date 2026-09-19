# Vidgets Support & Privacy

Standalone static website, separate from the iOS source repository. No dependencies, analytics, cookies, remote fonts, forms, or JavaScript in the published pages.

## Publish

1. Push the contents of this directory to your chosen GitHub repository.
2. In that repository, open Settings > Pages and publish the branch from its root directory.
3. Wait for the Pages deployment to finish and enable HTTPS if offered.
4. Visit the published URLs in a private browser window, without signing in.
5. Set the App Store Connect Privacy Policy URL to your published `privacy.html` URL and the Support URL to your published `support.html` URL.

All internal links are relative, so the site works at either a custom-domain root or a GitHub Pages project path. No custom domain or account is assumed. Nothing has been pushed or published for you.

## Files

- `index.html`: small support/privacy directory.
- `privacy.html`: complete generated privacy page, ready to serve.
- `support.html`: contact email, widget installation, connected-set explanation, troubleshooting, and deletion instructions.
- `assets/`: local styles and original brand mark.
- `.nojekyll`: disables unnecessary Jekyll processing.
- `content/privacy-policy.json`: the same policy content bundled in the iOS app.
- `build.mjs`: optional local generator for changes to the privacy policy. Hosting does not need Node or a build step.

## App Links

The app already includes an offline Privacy Policy and Help & Support, including `admin@technoforbes.com` and a copy-email fallback. It does not link to an unpublished or invented address.

After publishing, optionally add these **String** keys to `Vidget/Info.plist` and rebuild:

- `VidgetsPrivacyPolicyURL`: your full published HTTPS privacy-page URL.
- `VidgetsSupportURL`: your full published HTTPS support-page URL.

The app then shows web links in addition to the offline content. App Store Connect still requires the live public URLs regardless of whether you add those optional app links.

## Maintain

Edit the policy JSON, update its revision date, then run `node build.mjs`. Keep `Vidget/PrivacyPolicy.json` and this directory's `content/privacy-policy.json` identical. Updating this website does not update an already installed app's bundled policy.

To preview without a server, open `index.html`, `support.html`, or `privacy.html` locally. A local server may also be used for testing.

## Verification

Verified locally on 19 September 2026: all three pages at 390px and 1280px in light/dark modes, with JavaScript disabled and a nested project URL. Internal links, FAQ controls, 200% text layout, exact policy content, and absence of third-party requests passed. Review screenshots are in the ignored `output/` directory. `tests/verify.mjs` uses Playwright with installed Chrome for repeatable QA; Playwright is a development-only tool and is not needed for hosting.

## Before Submission

- Confirm the support inbox is monitored and can send/receive messages. No email was sent as part of creation.
- Confirm the policy accurately describes how you operate support and your email provider's retention practices. Add your legal operator name/address where applicable to your business and distribution regions. This is an implementation-matched policy draft, not a legal certification.
- If you change hosting away from GitHub Pages, update the hosting disclosure.
- Revisit the policy and App Store privacy answers before adding analytics, ads, accounts, purchases, cloud sync, or new SDKs.
- These pages do not guarantee App Review approval. See the iOS repository's `Docs/AppStoreReviewAudit.md` for the technical audit and remaining checks.
