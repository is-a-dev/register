# GitHub Pages

## Creating a GitHub pages repository
You can create a GitHub pages website by creating a repository with the name `<github-username>.github.io`. For more information about GitHub pages, please read through [their guide](https://guides.github.com/features/pages).

## Creating the domain file
Create a JSON file inside `domains` directory (`domains/<subdomain>.json`) with the following content
```json 
{
    "description": "Describe the use of this subdomain",
    "repo": "https://github.com/<github-username>/<github-username>.github.io",
    "owner": {
        "username": "<github-username>",
        "email": "email@address",
        "twitter": "<twitter-username>"
    },
    "record": {
        "CNAME": "<username>.github.io"
    }
} 
```

## Configuring
- After the pull request is merged, you will see a **404** error on `<your-subdomain>.is-a.dev`. To fix this, go to your GitHub pages repository's **Settings > GitHub pages > Custom domain** and add `<your-subdomain>.is-a.dev` in the given field. _Only do this **after** your pull request is merged._
- Check the **Enforce HTTPS** checkbox below the custom domain input.
