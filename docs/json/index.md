# JSON Format

## File name

**Note**: You can put `.` (dots) in your filename for registering a nested subdomain (e.g: `blog.example.is-a.dev`) however, each of the following criteria must be valid for all part of the file name.

The filename must pass the following criteria:

- Must be alpha-numeric in lowercase with dashes as seperators.
- Must be more than 2 characters long.
- Must have a `.json` file extension.

## Structure

### description (optional)

Describe your domain name and your usage.

### repo (optional)

This is a link to your website repository or your GitHub account.

### owner (required)

You need to specify some information about yourself here. This is so that you can be contacted if required.

In the owner object, the fields username and email are required. You can add more information in this object if you want.

```json
{
  "owner": {
    "username": "<github-username>",
    "email": "<email@address.tld>"
  }
}
```

If you don't wish to share your email address here, please share your Twitter or Discord or any other social media account.

```json
{
  "owner": {
    "username": "<github-username>",
    "email": "",
    "twitter": "twitter-handle",
    "discord": "discord-username"
  }
}
```

### record (required)

This is where you specify the DNS records that you require.

The supported types are:

- `A`
- `CNAME`
- `MX`
- `TXT`
- `URL`

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
      "1.1.1.1",
      "2.2.2.2",
      "3.3.3.3",
      "4.4.4.4"
    ]
  }
}
```

- **URL** redirection

```json
{
  "record": {
    "URL": "https://my-website.com"
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
  - TXT records can't be used for verification purposes

```json
{
  "record": {
    "TXT": "hello world"
  }
}
```
