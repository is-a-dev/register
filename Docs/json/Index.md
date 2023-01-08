# Domains JSON file
The way to register a subdomain is through a pull request. For example, to register `example.is-a.dev`, you would need to create a file named `domains/example.json`.

## Filename
**Note**: You can put `.` (dots) in your filename for registering a sub-subdomain (`blog.example.is-a.dev`) however, each of the following criteria must be valid for all part of your subdomain

The filename must pass the following criteria:

- Must be alpha-numeric in lowercase with dashes as seperators.
- Must be more than 2 characters long.
- Must have a `.json` file extension

## Structure

### owner (required)
You need to specify some information about yourself here. This is so that you can be contacted if required.
In the owner object, the fields username and email are required. You can add more information in this object if you want.
```json
{
  "owner": {
    "username": "<github-username>",
    "email": "<email@address>"
  }
}
```
If you don't wish to share your email address here, please share your twitter or discord or any other social media account.
```json
{
  "owner": {
    "username": "<github-username>",
    "email": "",
    "twitter": "twitter-handle",
    "discord": "discord-username-and-discriminator"
  }
}
```

### description
Describe your domain name and your usage. This is purely for documentation purpose and is optional.

### repo
This is a link to your website repository or your github account. This is purely for documentation purpose and is optional.

### record (required)
This is where you specify the DNS records.
The supported types are:

- `CNAME`
- `A`
- `URL`
- `MX`
- `TXT`

Below are some examples for the given record types:

- **CNAME** record must be a hostname (`something.tld`), it cannot be used in conjunction with any other record types.
```json
{
  "record": {
    "CNAME": "<github-username>.github.io"
  }
}
```
- **A** record must be a list of IPv4 addresses.
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
- **URL** redirection
```json
{
  "record": {
    "URL": "https://my-other-website.com"
  }
}
```
- **MX** record must be a list of hostnames.
```json
{
  "record": {
    "MX": [
      "mx1.improvmx.com",
      "mx2.improvmx.com"
    ]
  }
}
```
- **TXT** record can be any string value. **You can only have 1 TXT record.** 
- **Note: TXT records can't be used for verification purposes**
```json
{
  "record": {
    "TXT": "hello world"
  }
}
```
