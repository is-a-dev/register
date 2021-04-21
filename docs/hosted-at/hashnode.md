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
