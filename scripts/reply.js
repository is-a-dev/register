
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


## Need support with your domain?
If you're having trouble setting up your domain, [create an issue](https://github.com/is-a-dev/register/issues/new/choose). I'll try my best to get back to you asap!


## Love/Hate the service?
**Love it?** Leave it a **star**! Also consider **[donating](https://github.com/is-a-dev/register#donations)** so that I can keep this service running forever.

**Hate it?** Please leave your feedback by [creating an issue](https://github.com/is-a-dev/register/issues/new/choose). I'd really like to keep improving this service for developers.
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

