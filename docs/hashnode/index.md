# Hashnode Blog

When you create your Hashnode blog, hashnode provides a free `hashnode.dev` subdomain for you. However, you can set up your own `is-a.dev` subdomain, instead.

---

1. Log in to your Hashnode account.

2. Click on your **avatar** at the bottom-left corner of the page on **desktop** or top-right corner on **mobile**.

![Feed](https://cdn.hashnode.com/res/hashnode/image/upload/v1614932849541/cBNDGKXMj.png?auto=compress)

3. Click on the **Blog Dashboard** option from the popup modal to access your blog's dashboard.

![Feed](https://cdn.hashnode.com/res/hashnode/image/upload/v1614937218081/InvxVHXDy.png?auto=compress)

4. Navigate to the **Domain** tab and enter your domain without the **www** or **https://** prefix in the text field provided. Then click on the **Update** button to proceed.

![Blog Domain Tab](https://cdn.hashnode.com/res/hashnode/image/upload/v1614937377176/0cwddAywO.png?auto=compress)

5. Go to your fork of the `is-a-dev/register` repository, edit your subdomain's JSON file, make sure you remove any old records, then add the following to the `record` key:

```json
"CNAME": "hashnode.network"
```

6. Once done, your Hashnode blog will be setup to use your subdomain, all you have to do is wait ~24 hours for the DNS to propogate. These changes could take from 1 hour to around 48 hours, so please be patient, It'll most likely be ready within a hour.

---

If you need any more help, you can find Hashnode's support article on mapping a domain to your Hashnode blog: https://support.hashnode.com/docs/mapping-domain
