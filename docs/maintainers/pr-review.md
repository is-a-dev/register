# Reviewing pull requests
There are a few things you'll need to look out for when reviewing pull requests for domain registrations. This list is not exhaustive and will be updated.

---

### CI errors
A lot of minor issues will be caught in the CI checks
* JSON parsing issues
* Schema issues

If the CI is failing, tag the user and comment on the pr.

---

### Contents of the website
We need to make sure that the contents being hosted via the record being registered is used for malicious purposes.
To do this, we must try our best to verify the contents of website and if required ask some questions regarding the contents in the PR.

---

### Invalid email/social link
A way to contact the user is important in case we need to inform the users of some changes to the project.
Confirm if the email looks valid or the social user name/link works.
The user should have either an email or a valid social link.

❌ `"owner": { "username": "gh-username" }` is invalid as it doesn't contain an email or any social links

❌ `"email": "28372878+user-name@users.noreply.github.com"` is invalid as the email cannot be used

✅ `"owner": { "username": "phenax", "twitter": "twitter-username" }` is valid as it contains a social link

✅ `"owner": { "username": "phenax", "email": "email@gmail.com" }` is valid as it contains an email

---

### Invalid CNAME
CNAME has to be a hostname. Something like `example.com`.

❌ `http://example.com` is invalid as it contains a protocol `https://`

❌ `example.com/some/path` is invalid as it contains the path name `/some/path`

✅ `example.com` is valid as it is the hostname of the website

---

### Invalid A
A record has to be an array of ips.

❌ `"A": "211.211.211.211"` is invalid as it must be an array

❌ `"A": ["example.com"]` is invalid as it is not an ip address

✅ `"A": ["211.211.211.211", "211.211.211.212"]` is valid as it is an array of ips

---

### Invalid URL
The URL must have a protocol (`http://` or `https://`) and must be something like `https://example.com` or `https://example.com/some/path`.

❌ `example.com` is invalid as it doesn't contain the protocol

✅ `https://example.com/some/path` is valid as it contains a protocol

---

### Only one record type
Earlier, is-a-dev used to allow for handling https redirections along with CNAME but the way we handle requests has changed since then.
This is why a record file can only contain one record type. Either `CNAME` or `A` or `URL`.

❌ `"CNAME": "example.com", "URL": "https://something.com"` is invalid as it should only contain one type of record, either CNAME or URL.

