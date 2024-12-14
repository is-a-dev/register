<p align="center">
   <img alt="is-a.dev Banner" src="https://raw.githubusercontent.com/is-a-dev/register/main/media/banner.png">
</p>

<p align="center">
   <img alt="Domains" src="https://img.shields.io/github/directory-file-count/is-a-dev/register/domains?color=5c46eb&label=domains&style=for-the-badge">
   <img alt="Open Pull Requests" src="https://img.shields.io/github/issues-raw/is-a-dev/register?color=5c46eb&label=issues&style=for-the-badge">
   <img alt="Open Issues" src="https://img.shields.io/github/issues-pr-raw/is-a-dev/register?color=5c46eb&label=pull%20requests&style=for-the-badge">
   <br>
   <img alt="Publish" src="https://github.com/is-a-dev/register/actions/workflows/publish.yml/badge.svg">
</p>

<h1 align="center">is-a.dev</h1>

<p align="center"><strong>is-a-dev</strong> is a service that allows developers to get a sweet-looking ".is-a.dev" domain for their personal websites.</p>

## Announcements & Status Updates
Please join our [Discord server](https://discord.gg/is-a-dev-830872854677422150) for announcements, updates & upgrades, and downtimes regarding the service.
Not all of these will be posted on GitHub, however they will always be posted in our Discord server.

<a href="https://discord.gg/is-a-dev-830872854677422150"><img alt="Discord Server" src="https://invidget.wdh.app/is-a-dev-830872854677422150"></a>

# Register
### NS Records
When applying for NS records, please consider if you *actually* need them.
In your PR, please provide *extensive* reasoning, with evidence/examples, of why you need NS records.
You can see a good example of this [here](https://github.com/is-a-dev/register/pull/17592).

***Pull requests adding NS records without valid reasoning will be closed.***

**Instant Denials**:
- I don't want to create a pull request everytime I want to update my DNS records.
  - Over 3,000 people have to create PRs for updating their records, you can too.
- It is easier to manage DNS records on *(insert DNS provider name)*.
   - It isn't too difficult to open a pull request to update your DNS records. We aim for PRs to be merged with-in 24 hours.
- I want to use DDoS protection.
   - You can simply add `"proxied": true` to your file, to enable Cloudflare's Enterprise-level DDoS protection for your subdomain.

> [!NOTE]
> You can skip these requirements by [supporting the service](https://wdh.gg/pvNCdvs) with a small amount of $2.
>
> If you decide to donate, please email william@is-a.dev with your payment confirmation and your pull request link to receive your NS records.

## Manual Registration
> If you want a more visual guide, check out [this blog post](https://wdh.gg/tX3ghge).

- [Fork](https://github.com/is-a-dev/register/fork) and star this repository
- Add a new file called `your-domain-name.json` in the `domains` folder to register `your-domain-name.is-a.dev`
- [Read the documentation](https://is-a.dev/docs)
- Your pull request will be reviewed and merged. *Make sure to keep an eye on it incase we need you to make any changes!*
- After the pull request is merged, please allow up to 24 hours for the changes to propagate
- Enjoy your new `.is-a.dev` domain!

## Automated Registration
***Returning soon.*** Join our [Discord server](https://discord.gg/is-a-dev-830872854677422150) for updates.

# Issues
If you have any problems, feel free to [open an issue](https://github.com/is-a-dev/register/issues/new/choose).

If you have an issue that contains confidental infomation, send an email to security@is-a.dev.

---

We are proud to announce that we are fully supported by Cloudflare's [Project Alexandria](https://www.cloudflare.com/lp/project-alexandria) sponsorship program. We would not be able to operate without their help! 💖

<a href="https://www.cloudflare.com">
   <img alt="Cloudflare Logo" src="https://raw.githubusercontent.com/is-a-dev/register/main/media/cloudflare.png" height="96">
</a>
