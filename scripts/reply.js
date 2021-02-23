
const getInstructions = () => `
The changes have been published!! It should reflect in less than 24 hours.

## Here's what you need to do next
If your domain points to a server you own, add \`domain-name.is-a.dev\` to your server config. For https, you will have to configure ssl certificate to allow the new subdomain.

### For github pages users,
* Go to your github page repo (\`user/user.github.io\`)
* Open up the **settings** tab
* Scroll down to the **Github pages** section
* In the **Custom domain** text input, enter the domain you registered (\`domain-name.is-a.dev\`)
* Check the **Enforce HTTPS** checkbox below the input
* Give it some time to reflect and you should be good to go


## Need help with your domain?
If you are having trouble setting up your domain, [create an issue](https://github.com/is-a-dev/register/issues/new/choose). I will try my best to get back to you asap!


## Made a mistake in the record?
Don't worry, you can create a new pull request with the corrections


## Love/Hate the service?
**Love it?** Leave it a **star**! Also consider donating so that I can keep this service running forever!
**Hate it?** Please leave your feedback by [creating an issue](https://github.com/is-a-dev/register/issues/new/choose). I would really like to keep improving this service for other users.


## Wanna support this project?
Help me in my mission to keep this service alive forever by donating!

<a href="https://www.buymeacoffee.com/phenax" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="28" width="119"></a> <a href="https://liberapay.com/phenax" target="_blank"><img src="https://img.shields.io/badge/liberapay-donate-yellow.svg?style=for-the-badge" alt="Liberapay recurring donation button" /></a>

`;

module.exports = {
  async instructions(context, github) {
    const pr = context.payload.issue || context.payload.pull_request;
    const { number } = pr;

    await github.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: number,
      body: getInstructions(),
    });
  }
};

