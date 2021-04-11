# Reviewing pull requests
There are a few things you'll need to look out for when reviewing pull requests for domain registrations. This list is not exhaustive and will be updated.


### CI errors
A lot of minor issues will be caught in the CI checks
* JSON parsing issues
* Schema issues

If the CI is failing, tag the user and comment on the pr.


### Invalid email/social link
A way to contact the user is important in case we need to inform the users of some changes to the project.
Confirm if the email looks valid or the social user name/link works.
The user should have either an email or a valid social link.


### Invalid CNAME
CNAME has to be a hostname. Something like 'example.com'.
People tend to accidentally put a url there instead sometimes like `http://something.com` or `something.com/path`.
Both of those are invalid.


### Invalid A
A record has to be an array of ips


### Only one record type
Earlier, is-a-dev used to allow for handling https redirections along with CNAME but the way we handle requests has changed since then.
This is why a record file can only contain one record type. Either `CNAME` or `A` or `URL`.

