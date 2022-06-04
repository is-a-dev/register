# For github pages

### Creating a github pages repo
You can create a github pages website by creating a repo with the name `<your-github-username>.github.io`.
For more information about github pages, please read through [their guide](https://guides.github.com/features/pages/).


### Domains file
Create a json file inside the `domains` directory (`domains/<subdomain>.json`) with the following contents
```json
{
  "description": "Add some description",
  "repo": "https://github.com/<your-github-username>/<your-github-username>.github.io",
  "owner": {
    "username": "<your-github-username>",
    "email": "<your-email>",
    "twitter": "<your-twitter-username>"
  },
  "record": {
    "CNAME": "<replace-this-with-your-github-username>.github.io"
  }
}
```

### Configuring your repo
* After the pull request is merged, you will see a 404 error on `your-domain.is-a.dev`. To fix this go to your github page repo's `Settings > Github pages > Custom domain` and add `your-domain.is-a.dev` in the given field
* Check the `Enforce HTTPS` checkbox below the custom domain input

