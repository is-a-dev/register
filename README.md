![is-a-dev banner](./media/banner.png)

<br/>

**is-a-dev** is a service that allows developers to get a sweet-looking `.is-a.dev` domain for their personal websites.

<p align="center"> <a href="https://discord.gg/PZCGHz4RhQ"><img src="https://discord.com/api/guilds/830872854677422150/widget.png?style=banner2" alt="Discord"></a></p>


## How do I register?
* [Read the guide](https://github.com/omxpro/register#how-to-register)
* The PR will be reviewed and merged
* After merging, the changes will take effect within a day
* That's it! Done! Now go show off your cool `.is-a.dev` domain

## Guide
# How to register
You can read the [domains.json file api reference]()

## Forking the repo
* Go to [here](https://github.com/is-a-dev/register/fork) and fork the repo
* Do your changes
* Make a pull request using the contribute button.
* Picture: ![image](https://media.discordapp.net/attachments/949604552779390976/965224826425999400/Screenshot_20220417-174804_Brave.jpg)
## Want to pull changes?
* Use the fetch upstream and merge button that is near the contribute button

* Picture: ![image](https://media.discordapp.net/attachments/949604552779390976/965225298167754792/Screenshot_20220417-174957_Brave.jpg)

## Websites hosted at
### 1. GitHub Pages ← This is the recommended way to host your website.
#### Creating a github pages repo
You can create a github pages website by creating a repo with the name `<your-github-username>.github.io`.
For more information about github pages, please read through [their guide](https://guides.github.com/features/pages/).


#### Domains file
Create a json file inside the `domains` directory (`domains/<subdomain>.json`) with the following contents
```json
{
  "description": "Add some description",
  "repo": "https://github.com/github-username/github-username.github.io",
  "owner": {
    "username": "github-username",
    "email": "any@email",
    "twitter": "your-twitter-username"
  },
  "record": {
    "CNAME": "<replace-this-with-your-github-username>.github.io"
  }
}
```

#### Configuring your repo
* After the pull request is merged, you will see a 404 error on `your-domain.is-a.dev`. To fix this go to your github page repo's `Settings > Github pages > Custom domain` and add `your-domain.is-a.dev` in the given field
* Check the `Enforce HTTPS` checkbox below the custom domain input

### 2. For hashnode blogs
When you create your Hashnode blog, hashnode provides a free **yourdomain.hashnode.dev** subdomain for you. However, you can set up your own **.is-a.dev** subdomain.

In this guide, you will learn how to accomplish this.

---

1. Log in to your Hashnode account.

2. Click on your **profile picture** at the bottom-left corner of the page on *desktop* screen or top-right corner on *mobile* screen.

![Hashnode's Feed](https://cdn.hashnode.com/res/hashnode/image/upload/v1614932849541/cBNDGKXMj.png?auto=compress)

3. Click on the **Blog Dashboard** option from the popup modal to access your blog's dashboard.

![Hashnode's Feed](https://cdn.hashnode.com/res/hashnode/image/upload/v1614937218081/InvxVHXDy.png?auto=compress)

4. Navigate to the **DOMAIN** tab and enter your domain without the **www** or **https://** prefix in the text field provided. Then click on the **Update** button to proceed.

![Hashnode's Blog Domain Tab](https://cdn.hashnode.com/res/hashnode/image/upload/v1614937377176/0cwddAywO.png?auto=compress)

5. Go To Your Fork Of The `is-a-dev/register` repo, edit your subdomain's JSON file, make sure you remove any old records, then add this:
```json
"CNAME": "hashnode.network"
```

Once Done, your hashnode blog is setup to use your subdomain, all you have to do is wait sometime for the DNS to propogate. These changes could take from 1 hour to around 48 hours, so please be patient, It'll most likely be ready within a hour.
Enjoy Your Hashnode Blog, With Your Sweet `.is-a.dev` Subdomain! **If You Need More Help:** please read this support article on hashnode support: https://support.hashnode.com/docs/mapping-domain/, this should help you more, if you need more help related to [Hashnode](https://hashnode.com), then please visit the [Hashnode Support Center](https://support.hashnode.com/). Remeber, is-a.dev has no links with hashnode, so please do not create issues on our github, saying that your hashnode blog is having issues, we simply will not respond to them.

### 3. For other services
#### Domains file
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

#### Record
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

#### Configuring your server
After the pull request is merged, **configure your server** (apache, nginx, whatever) to work with `<subdomain>.is-a.dev`. If you are unsure how to configure your server, you can create an issue for support.

You should also, include `<subdomain>.is-a.dev` in your **ssl certificate** to get rid of certificate errors

### JSON structure
#### Domains json file
The way you register your own domain name is through a pull request.
To register `my-domain.is-a.dev`, you need to create a `domains/my-domain.json` file

#### Filename
The file name must pass the following criteria -

> NOTE: You can use `.` (dots) in your file name (for registering `blog.mysubdomain.is-a.dev`) but each of the following criteria must be valid for all part of your subdomain

* Must be alpha-numeric in lowercase with dashes as seperators
* Must be more than 2 characters long
* Must have a `.json` file extension


The file needs to have the following fields -

#### owner (required)
You need to specify some information about yourself here.
This is so that you can be contacted if required.

In the owner object, the fields `username` and `email` are required. You can however add more information in this object if you need.
```json
{
  "owner": {
    "username": "github-username",
    "email": "any@email"
  }
}
```

If you don't wish to share your email address here, please share your twitter, discord or any other social media account.
```json
{
  "owner": {
    "username": "github-username",
    "email": "",
    "twitter": "twitter-handle"
  }
}
```


#### description
Describe your domain name and your usage. This is purely for documentation purpose and is optional.


#### repo
This is a link to your website repository or your github account. This is purely for documentation purpose and is optional.


#### record (required)
This is where you specify the DNS records you wish to use.

The supported record types are: `CNAME`, `A`, `URL`, `MX` and `TXT`

Here's a few different use cases for the given record types -

* **CNAME**
CNAME must be a host name (Eg - `something.tld`). CNAME cannot be used in conjunction with any other record types.
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

* **MX**
MX must be a list of host names
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

* **TXT**
TXT can be any string value. **You can only have 1 TXT record.**
```json
{
  "record": {
    "TXT": "hello world"
  }
}
```


## Vercel & Netlify Note
You will encounter an SSL certificate issue when using Vercel and Netlify. Neither service will work with our domains. It is recommend to use [Github Pages](https://github.com/is-a-dev/register/blob/add-hosting-warning/docs/hosted-at/github-pages.md) or [Railway](https://railway.app/) instead.

## Guidelines for is-a.dev domain

* Some guidelines can be found in [here](./guidelines.md) 

Guidelines means that what you are supposed to have if you want a is-a.dev domain.

#### Thanks for reading! Have a nice time with your is-a.dev domain! We hope to see you again. Bye 👋!




## Donations
This project is a free and open source service for developers and will stay that way.

Please consider donating to help me keep this running forever!

Also, consider starring this repo!

<a href="https://www.buymeacoffee.com/phenax" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="28" width="119"></a>
<a href="https://liberapay.com/phenax" target="_blank"><img src="https://img.shields.io/badge/liberapay-donate-yellow.svg?style=for-the-badge" alt="Liberapay recurring donation button" /></a>




## Similar services
You should also checkout -
* [js.org](https://github.com/js-org/js.org/tree/master) (**NOTE**: `js.org` is specifically for JS focused project)
* [runs-on.tech](https://github.com/aakhilv/runs-on.tech)



## Uptime

![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m787472645-ec25e3920c7af893a7c66f19?label=uptime%20-%20dns&style=for-the-badge)
![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m787472617-240f4d61a5439a87becb2cf9?label=uptime%20-%20redirections&style=for-the-badge)

You can check the uptime of the service via [our status dashboard](https://stats.uptimerobot.com/zY4XKIRVzw)




## License
This project is under the [GPL-3.0](./LICENSE) license.
