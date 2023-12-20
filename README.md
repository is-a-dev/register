<p align="center">
   <img alt="is-a-dev Banner" src="https://raw.githubusercontent.com/is-a-dev/register/main/media/banner.png">
</p>

<p align="center">
   <img alt="Domains" src="https://img.shields.io/github/directory-file-count/is-a-dev/register/domains?color=5c46eb&label=domains&style=for-the-badge">
   <img alt="Open Pull Requests" src="https://img.shields.io/github/issues-raw/is-a-dev/register?color=5c46eb&label=issues&style=for-the-badge">
   <img alt="Open Issues" src="https://img.shields.io/github/issues-pr-raw/is-a-dev/register?color=5c46eb&label=pull%20requests&style=for-the-badge">
</p>

<h1 align="center">is-a.dev</h1>

<p align="center"><strong>is-a-dev</strong> is a service that allows developers to get a sweet-looking ".is-a.dev" domain for their personal websites.</p>

<p align="center">
   <a href="https://discord.gg/PZCGHz4RhQ"><img alt="Discord Server" src="https://discord.com/api/guilds/830872854677422150/widget.png?style=banner2"></a>
</p>

## Issues

If you have any problems then feel free to open a issue on github.
If you have an issue that contains confidental infomation then email hello@maintainers.is-a.dev any other emails will be ignored.

## Register

### Automated Registration
Easiest method: Use the [manage website](https://manage.is-a.dev), sign in with your GitHub account and click the register page in the navbar. Fill out some questions and it will all happen automatically!

Another method is to join our [Discord server](https://discord.gg/PZCGHz4RhQ), head to the commands channel and run `/register`. The bot will ask you a few questions then will generate your PR and domain automatically. The bot also allows for domain deletion and editing.

### Manual Registration
- [Fork](https://github.com/is-a-dev/register/fork) this repository.
- Add a new file called `your-domain-name.json` in the `domains` folder to register `your-domain-name.is-a.dev`.
- [Read the documentation](https://is-a.dev/docs).
- Your pull request will be reviewed and merged. *Make sure to keep an eye on it incase we need you to make any changes!*
- After the pull request is merged, please allow up to 24 hours for the changes to propagate.
- Enjoy your new `.is-a.dev` domain!

### CLI Registration
For issues with the CLI, **DO NOT OPEN AN ISSUE ON THIS REPOSITORY**, instead open an issue [here](https://github.com/wdhdev/is-a-dev-cli/issues/new).

Install the CLI:

```bash
npm install @is-a-dev/cli -g
```  

Login to the CLI:

```bash
is-a-dev login
```

Register a subdomain on the CLI:

```
is-a-dev register
```

## Status
You can check the uptime of our services on our [status dashboard](https://status.is-a.dev).

### Similar Services
If you want to find services similar to is-a.dev, take a look on [free-for.life](https://free-for.life/#/?id=domains).

### Donate
If you like this project, please consider donating so we can keep this project running forever!

<a href="https://www.buymeacoffee.com/phenax" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me a Coffee" height="28" width="119"></a>
<a href="https://liberapay.com/phenax" target="_blank"><img src="https://img.shields.io/badge/liberapay-donate-yellow.svg?style=for-the-badge" alt="Liberapay"></a>
