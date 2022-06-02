# For other hosting services

### Domains file
Create a json file inside the `domains` directory (`domains/<subdomain>.json`) with the following contents
```json
{
  "description": "Add some description",
  "repo": "https://github.com/github-username",
  "owner": {
    "username": "github-username",
    "email": "any@email"
  },
  "record": {}
}
```

### Record
In your `record` key of the json file, you need to add one of the following -
* CNAME record
```json
{
  "record": {
    "CNAME": "the-domain-you-own.com"
  }
}
```

* A records
```json
{
  "record": {
    "A": [
      "69.69.69.69",
      "69.69.69.70"
    ]
  }
}
```

* URL redirection
```json
{
  "record": {
    "URL": "https://your-website.com"
  }
}
```

### Configuring your server
After the pull request is merged, **configure your server** (apache, nginx, whatever) to work with `<subdomain>.is-a.dev`. If you are unsure how to configure your server, you can create an issue for support.

You should also, include `<subdomain>.is-a.dev` in your **ssl certificate** to get rid of certificate errors

