<p align="center">
   <img alt="is-a.dev Banner" src="https://raw.githubusercontent.com/is-a-dev/register/main/media/banner.png">
</p>

<p align="center">
   <img alt="Domains" src="https://img.shields.io/github/directory-file-count/is-a-dev/register/domains?color=5c46eb&label=domains&style=for-the-badge">
   <img alt="Open Pull Requests" src="https://img.shields.io/github/issues-raw/is-a-dev/register?color=5c46eb&label=issues&style=for-the-badge">
   <img alt="Open Issues" src="https://img.shields.io/github/issues-pr-raw/is-a-dev/register?color=5c46eb&label=pull%20requests&style=for-the-badge">
   <br>
</p>

<h1 align="center">is-a.dev</h1>

<p align="center"><strong>is-a.dev</strong> is a service that allows developers to get a sweet-looking <code>.is-a.dev</code> subdomain for their personal websites.</p>

## Announcements & Status Updates
Please join our [Discord server](https://discord.gg/is-a-dev-830872854677422150) for announcements, updates & upgrades, and downtime notifications regarding the service.
Not all of these will be posted on GitHub[^1], however they will always be posted in our Discord server.

[^1]: We usually only post announcements on GitHub in the case of a serious incident. In that case, you'll likely see it at the top of this README file.

<a href="https://discord.gg/is-a-dev-830872854677422150"><img alt="Discord Server" src="https://invidget.api.hrsn.dev/is-a-dev-830872854677422150"></a>

# Register
> If you want a visual guide, check out [this blog post](https://wdh.gg/tX3ghge).

- [Fork](https://github.com/is-a-dev/register/fork) this repository.
- [Read the documentation](https://docs.is-a.dev).
   - If you are applying for NS records please read [this](#ns-records).
- Your pull request will be reviewed and merged. *Keep an eye on it in case changes are needed!*
- After the pull request is merged, your DNS records should be published with-in a few minutes.
- Enjoy your new `.is-a.dev` subdomain! Please consider leaving us a star ⭐️ to help support us!

## Quick Start

1) Create a new file at `domains/<your-subdomain>.json` in your fork.

2) Use this minimal template and update the values:

```json
{
  "owner": {
    "username": "your-github-username",
    "email": "you@example.com"
  },
  "records": {
    "CNAME": "your-site.example.com"
  }
}
```

3) Commit and open a Pull Request using the provided PR template.

4) Ensure your site is reachable, development-related, and follows the [Terms of Service](https://is-a.dev/terms). The CI will run checks and reviewers may request changes.

5) Once merged, records are pushed to Cloudflare and your subdomain becomes active within minutes.

> Tip: Some names are reserved or internal. See `util/reserved.json` and `util/internal.json`.

## Domain File Structure

Each domain configuration is a single JSON file under `domains/` named after your desired subdomain (for example, `jeel.json` → `jeel.is-a.dev`).

- Required fields:
  - `owner.username`: Your GitHub username
  - `owner.email`: A valid contact email (or see docs for acceptable alternatives)
  - `records`: One or more DNS records

- Common records:
  - `A`, `AAAA`, `CNAME`, `TXT`, `MX`, `SRV`, `CAA`, `NS` (restricted; see below)
  - See the [FAQ: supported record types](https://docs.is-a.dev/faq/#which-dns-record-types-are-supported)

Example CNAME and TXT:

```json
{
  "owner": { "username": "octocat", "email": "octo@example.com" },
  "records": {
    "CNAME": "myapp.vercel.app",
    "TXT": "some-verification-token"
  }
}
```

Constraints and policies:

- Names listed in `util/reserved.json` and `util/internal.json` cannot be registered.
- Certain CNAME targets are disallowed (see `util/disallowed-cnames.json`).
- NS records are restricted. If you truly need NS, see the section below and provide justification.

### NS Records
When applying for NS records, please be aware we already support a [wide range of DNS records](https://docs.is-a.dev/faq/#which-dns-record-types-are-supported), so you likely do not need them. 

In your PR, please explain why you need NS records, including examples, to help mitigate potential abuse. Refer to the [FAQ](https://docs.is-a.dev/faq/#who-can-use-ns-records) for guidelines on allowed usage.

***Pull requests adding NS records without sufficient reasoning will be closed.***

> Also see: [Why are NS records restricted?](https://docs.is-a.dev/faq/#why-are-ns-records-restricted)

## Local Development

You don’t need to run a server. To validate your changes locally, you can run tests:

```bash
npm install
npm test
```

Tests are written with [AVA](https://avajs.dev/). The CI will also validate changes automatically on your PR.

## CI/CD Overview

- On Pull Requests and pushes to `main`, the workflow at `.github/workflows/ci.yml` runs:
  - Installs dependencies and runs tests: `npx ava tests/*.test.js`
  - If `dnsconfig.js` changed, runs DNSControl checks

- On merge to `main`, `.github/workflows/publish.yml`:
  - Generates credentials
  - Uses `is-a-dev/dnscontrol-action` to push DNS updates to Cloudflare

## Troubleshooting

- Ensure your website is publicly reachable and not just a placeholder.
- Confirm your subdomain name is not in `util/reserved.json` or `util/internal.json`.
- Avoid disallowed CNAME targets listed in `util/disallowed-cnames.json`.
- Fill out every required item in the PR template and provide a preview (link or screenshot).
- If CI fails, read the logs in your PR’s Checks tab and address the feedback.

## Useful Links

- Docs: https://docs.is-a.dev
- Terms of Service: https://is-a.dev/terms
- Report Abuse: https://github.com/is-a-dev/register/issues/new?assignees=&labels=report-abuse&projects=&template=report-abuse.md&title=Report+abuse
- Discord: https://discord.gg/is-a-dev-830872854677422150

## Report Abuse
If you find any subdomains being used for abusive purposes, please report them by [creating an issue](https://github.com/is-a-dev/register/issues/new?assignees=&labels=report-abuse&projects=&template=report-abuse.md&title=Report+abuse) with the relevant evidence.

---

We are proud to announce that we are supported by Cloudflare's [Project Alexandria](https://www.cloudflare.com/lp/project-alexandria) sponsorship program. We would not be able to operate without their help! 💖

<a href="https://www.cloudflare.com">
   <img alt="Cloudflare Logo" src="https://raw.githubusercontent.com/is-a-dev/register/main/media/cloudflare.png" height="96">
</a>
