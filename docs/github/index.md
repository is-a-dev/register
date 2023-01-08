# GitHub Pages

## 1. Creating a repository

**If you have already created a repository and setup GitHub Pages, you can skip this step.

You can create a GitHub Pages website by creating a repository with the name `<github-username>.github.io`. For more information about GitHub Pages, please read through the GitHub Pages [docs](https://guides.github.com/features/pages).

## 2. Register a subdomain

First, create a JSON file inside `domains` directory (`domains/<subdomain>.json`) with the following content:

```json 
{
    "description": "A description of your website",
    "repo": "https://github.com/<github-username>/<github-username>.github.io",
    "owner": {
        "username": "<github-username>",
        "email": "email@address.tld"
    },
    "record": {
        "CNAME": "<github-username>.github.io"
    }
} 
```

## 3. Configure your subdomain

- **After your pull request is merged**, you will see a **404** error on `<subdomain>.is-a.dev`. To fix this, go to your repository and go to: **Settings > Pages > Custom Domain** and add `<subdomain>.is-a.dev` in the given field.
- Check the **Enforce HTTPS** checkbox below the custom domain input, after the SSL certificate has been generated.
