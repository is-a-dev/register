# Domains json file
The way you register your own domain name is through a pull request.
To register `my-domain.is-a.dev`, you need to create a `domains/my-domain.json` file

### Filename
The file name must pass the following criteria -
* Must be alpha-numeric in lowercase with dashes as seperators
* Must be more than 2 characters long
* Must have a `.json` file extension


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

If you don't wish to share your email address here, please share your twitter or any other social media account.
```json
{
  "owner": {
    "username": "github-username",
    "email": "",
    "twitter": "twitter-handle"
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
CNAME must be a host name (Eg - `something.tld`)
```json
{
  "record": {
    "CNAME": "username.github.io"
  }
}
```

* **A record**
A record must be a list of ips
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

