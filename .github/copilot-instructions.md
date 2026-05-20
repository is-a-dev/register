# GitHub Copilot Instructions for is-a-dev/register

## Repository Purpose
This repository handles pull requests that register new `.is-a.dev` subdomains. Every PR adds or modifies **only** JSON files in the `domains/` directory. These files define DNS records.

Copilot must review **every PR** with these priorities:
1. The PR description **must** exactly match and fully complete the `.github/PULL_REQUEST_TEMPLATE.md`
2. Every JSON file must follow the exact filename rules, JSON schema, and validation rules from https://docs.is-a.dev/domain-structure/
3. If anything is wrong in the PR description **or** any JSON file, post a clear comment using the exact copy-pasta error messages (or very close variations that match the style). Be direct and helpful.
4. Only comment on real issues. Do not approve the PR if any errors exist.

## PR Description / Template Check (Critical)
(unchanged from previous version — keep the same checks and copy-pasta for incomplete template, no preview, inaccessible site, etc.)

## Filename Rules (Strict)
Files **must** be in the `domains/` directory and follow these exact rules:
- Must end in `.json`
- All lowercase letters only (no uppercase anywhere)
- Alphanumeric + dashes/underscores only (no consecutive dashes)
- Filenames (without `.json`) **cannot** match any entry in `util/reserved.json`

Reserved names are listed in `util/reserved.json`. These subdomain names may NOT be registered.

**Invalid filename errors to use verbatim:**
- "File does not end in .json. Make sure the file extension is correct. Reopen this PR when you have this corrected."
- "File is not in the correct directory. Must be in the domains directory. Reopen this PR when you have this corrected."
- "Filenames cannot have uppercase characters. See docs for more information: https://docs.is-a.dev/"
- "Filename is reserved. See util/reserved.json for the full list. Reopen this PR when you have this corrected."

## JSON Schema & Validation Rules (Updated & Expanded)
Every file must be valid JSON and follow this exact structure from https://docs.is-a.dev/domain-structure/:

```json
{
  "owner": {
    "username": "exact-github-username-of-pr-author",
    "email": "optional@email.com"
  },
  "records": {
    // record types here
  }
}
```

**Critical rules (enforce strictly):**

- `"owner"."username"` **MUST** exactly match the GitHub username of the person who opened the PR, **unless** the PR author is a trusted maintainer listed in `util/trusted.json`.  
  Trusted maintainers: STICKnoLOGIC, DEV-DIBSTER, iostpa, orangci, Stef-00012, satr14washere, wdhdev.

- `"records"` is required (note: it must be `"records"`, never `"record"`).
- **CNAME records cannot be used with any other records and vice versa.** Only one record type is allowed if CNAME is present.
- **A records must be an array of strings** (never a single string, object, or scalar value). Example: `"A": ["192.0.2.1"]`
- A records **cannot** contain public DNS resolver IPs (Cloudflare, Google, Quad9, OpenDNS, etc.). Prohibited examples: 1.1.1.1, 1.1.1.2, 1.0.0.1, 8.8.8.8, 8.8.4.4, 9.9.9.9, 149.112.112.112, 208.67.222.222, 208.67.220.220.
- CNAME must be a single lowercase string (no protocols, no paths, no query parameters, no arrays).
- TXT verification records must be paired correctly (separate `_vercel.*.json` for Vercel, proper TXT for GitHub Pages).
- Other record types (AAAA, MX, NS, etc.) must follow the exact array/object formats shown in the docs.

**Use these exact (or matching-style) error messages:**
- "File does not follow proper schema. See docs for more information: https://docs.is-a.dev/"
- "This should be `records` not `record`."
- "Cannot use CNAME in conjunction with other records and vice versa. See docs for more information: https://docs.is-a.dev/"
- "A records must be placed within an array. Example: \"A\": [\"192.0.2.1\"]. Reopen this PR when fixed."
- "A records cannot use public DNS resolver IPs (1.1.1.1, 8.8.8.8, 9.9.9.9, etc.). Reopen this PR when fixed."
- "Invalid username, username does not match the GitHub account that is opening the pull request. See docs for more information: https://docs.is-a.dev/ (trusted maintainers exempt — see util/trusted.json)"
- "Invalid CNAME. CNAME cannot contain protocols, file paths, URL parameters, or anything combination of those. CNAME records must be lowercased. See docs for more information: https://docs.is-a.dev/ Reopen PR when this is fixed."
- All previous verification, JSON, and socials copy-pasta remain valid.

## Verification-Specific Guidance

## General Review Style
- Be concise and use the exact copy-pasta messages whenever they match the issue.
- Always link back to https://docs.is-a.dev/ or the specific guide.
- If the site has "Little content provided" → use the existing copy-pasta.
- For new rule violations, use the exact phrasing above so maintainers instantly recognize the feedback.
- Suggest reopening the PR after fixes.
- You may add a short polite note around the copy-pasta, but keep the core error verbatim.
- Do not approve or merge any PR that has errors.

Follow these instructions on every PR review. This ensures full consistency with the automated tests in `/tests`, the reserved/trusted lists, and maintainer expectations.
