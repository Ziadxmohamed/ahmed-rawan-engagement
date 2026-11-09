# Deployment

- GitHub: https://github.com/Ziadxmohamed/ahmed-rawan-engagement
- Selected Cloudflare Pages project: `ahmed-rawan2026`
- Production URL: https://ahmed-rawan2026.pages.dev
- Method: direct upload of the verified local `dist/` build.
- Automatic deployments: **not enabled**.
- Build configuration verified through the Cloudflare API: `npm run build`, output `dist`, root repository directory, Node.js 24.

Creating native GitHub integration returned Cloudflare error `8000011`: an internal issue with the account's Cloudflare Pages Git installation. No claim is made that Git integration is active. Direct upload is used as the authorized fallback.

The preferred global URLs `ahmed-rawan.pages.dev` and `ahmed-and-rawan.pages.dev` were already occupied. Creating those project names allocated suffixed domains. The third requested choice was available exactly and is the selected deployment. The two new, empty setup projects `ahmed-rawan` and `ahmed-and-rawan` were not deployed; no pre-existing projects or DNS records were modified or deleted.

## Deploy an update

```sh
npm ci
npm test
npm run build
npx wrangler pages deploy dist --project-name ahmed-rawan2026 --branch main
```

Push the corresponding source commit to GitHub before deployment. Do not use `--force` for subsequent deployment commands. The installed Wrangler used that flag only to select the original Pages product during initial creation, instead of delegating creation to Workers; it is not needed for this existing project.

For automatic deployments later, the existing Pages project can be deployed from a GitHub Actions workflow using a narrowly scoped deployment token kept in repository secrets. Repairing the account's native Pages Git installation is another option for a separately created Git-connected project. Never commit a token or copy the broad local OAuth session into a repository.

The final browser automation pass was unavailable because computer-use tools timed out. Publication is verified separately using Cloudflare deployment status and HTTP checks; device-specific layout, GPU animation and native calendar handoff remain subject to actual-device review. See `QA.md` for the full verification boundary.

A new dedicated project, `ahmed-rawan2026`, supplies the shorter couple-name sharing URL requested after launch. The earlier `our-next-chapter-ar` project and its verified version URL are retained; no existing project or DNS record was deleted or overwritten. Social metadata, the downloadable card and the heart QR image use the new canonical origin.
