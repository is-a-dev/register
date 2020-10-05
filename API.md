# Documentation

## How to register
* First you need to create a pull request with your `domains/my-domain.json` file
* This PR will be reviewed, merged
* The changes will take effect in less than a day after the PR gets merged
* `Github pages` users, need to go to their repo settings page and change the domain to `your-domain.is-a.dev` after everything is done
* And that's it

Example (for github pages) -
```json
{
  "description": "Add some description",
  "repo": "https://github.com/user/user.github.io",
  "owner": {
    "username": "your-github-username",
    "email": "any@email"
  },
  "records": {
    "CNAME": "user.github.io"
  }
}
```


## Domains json file
The way you register your own domain name is through a pull request.
To register `my-domain.is-a.dev`, you need to create a `domains/my-domain.json` file

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


### records (required)
This is where you specify how you want to link to your server/webpage.

Currently, only `CNAME`, `ALIAS`, `A`, `URL` record types are supported.

Here's a few different use cases for the given record types -

* **CNAME/ALIAS**
Replace CNAME with ALIAS for alias record type
```json
{
  "records": {
    "CNAME": "username.github.io"
  }
}
```

* **A record**
```json
{
  "records": {
    "A": [
      "999.999.991.999",
      "999.999.992.999",
      "999.999.993.999",
      "999.999.994.999",
    ]
  }
}
```

* **URL redirection**
```json
{
  "records": {
    "URL": "https://my-other-website.com"
  }
}
```

* **Force HTTPS on your CNAME (or ALIAS or A) record**
```json
{
  "records": {
    "CNAME": "username.github.io",
    "URL": "https://your-domain.is-a.dev"
  }
}
```

