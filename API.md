# Documentation

## How to register
* First you need to create a pull request with your `domains/my-domain.json` file
* This PR will be reviewed
* The changes will take effect soon after the PR gets merged
* And that's it

### For github pages users
* A github pages json file (with cname record and https redirection) will look something like this -
```json
{
  "description": "Add some description",
  "repo": "https://github-username.github.io/github-pages-enabled-repo-that-[your-domain.is-a.dev]-points-to",
  "owner": {
    "username": "github-username",
    "email": "any@email"
  },
  "record": {
    "CNAME": "github-username.github.io"
      "URL": "www.your-domain.is-a.dev"
  }
}
```
* After the pull request is merged, you will see a 404 error on `your-domain.is-a.dev`. To fix this go to your github page repo's `Settings > Github pages > Custom domain` and add `https://www.your-domain.is-a.dev` in the given field.
* Check the `Enforce HTTPS` checkbox below the custom domain field.
* For all pages resolve faster, change your github-pages-enabled repo branch name from 'main' to 'www.your-domain.is-a.dev', and set it as root in GitHub Pages settings.
* If no CNAME - then is-a.dev NS won't resolve your repo, and page will give 404.

## Domains json file
The way you register your own domain name is through a pull request.
To register `my-domain.is-a.dev`, you need to create a `domains/my-domain.json` file

The file name must pass the following criteria -
* Must be alpha numeric with dashes as seperators
* Must be more than 2 characters long


The file needs to have the following fields -

### owner (required)
You need to specify some information about yourself here.
This is so that you can be contacted if required.

In the owner object, the fields `username` and `email` are required. You can however add more information in this object if you need.
```json
{
  "owner": {
    "username": "github-username",
    "email": "any@email"
  },
}
```

### description
Describe your domain name and your usage. This is purely for documentation purpose and is optional.


### repo
This is a link to your website repository or your github account. This is purely for documentation purpose and is optional.


### record (required)
This is where you specify how you want to link to your server/webpage.

Currently, only `CNAME`, `A`, `URL` record types are supported.

Here's a few different use cases for the given record types -

* **CNAME**
```json
{
  "record": {
    "CNAME": "username.github.io"
  }
}
```

* **A record**
```json
{
  "record": {
    "A": [
      "999.999.991.999",
      "999.999.992.999",
      "999.999.993.999",
      "999.999.994.999"
    ]
  }
}
```

* **URL redirection**
```json
{
  "record": {
    "URL": "https://my-other-website.com"
  }
}
```

