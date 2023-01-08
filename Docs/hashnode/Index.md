# Hashnode Blog
When you create your hashnode blog, hashnode provides a free `hashnode.dev` subdomain for you. However, you can set up your own `is-a.dev` subdomain.

In this guide, you will learn how to accomplish this.

---

1. Log in to your Hashnode account.

1. Click on your **avatar** at the bottom-left corner of the page on **desktop** or top-right corner on **mobile**.

![Hashnode's Feed](https://cdn.hashnode.com/res/hashnode/image/upload/v1614932849541/cBNDGKXMj.png?auto=compress)

1. Click on the **Blog Dashboard** option from the popup modal to access your blog's dashboard.

![Hashnode's Feed](https://cdn.hashnode.com/res/hashnode/image/upload/v1614937218081/InvxVHXDy.png?auto=compress)

1. Navigate to the **Domain** tab and enter your domain without the **www** or **https://** prefix in the text field provided. Then click on the **Update** button to proceed.

![Hashnode's Blog Domain Tab](https://cdn.hashnode.com/res/hashnode/image/upload/v1614937377176/0cwddAywO.png?auto=compress)

1. Go to your fork of the `is-a-dev/register` repository, edit your subdomain's JSON file, make sure you remove any old records, then add this:
```json
"CNAME": "hashnode.network"
```

Once done, your hashnode blog is setup to use your subdomain, all you have to do is wait sometime for the DNS to propogate. These changes could take from 1 hour to around 48 hours, so please be patient, It'll most likely be ready within a hour.
Enjoy your hashnode Blog, With Your Sweet `.is-a.dev` Subdomain! **If your need more help:** please read this support article on hashnode support: https://support.hashnode.com/docs/mapping-domain/, this should help you more, if you need more help related to [Hashnode](https://hashnode.com), then please visit the [Hashnode Support Center](https://support.hashnode.com/). Remeber, is-a.dev has no links with hashnode, so please do not create issues on our github, saying that your hashnode blog is having issues, we simply will not respond to them.
