# Security policy

## Reporting a vulnerability

Please **don't open a public issue** for security problems.

Report them privately through GitHub instead: go to the repository's **Security** tab and click **Report a vulnerability** (or open <https://github.com/oliverkuzio/travel-log/security/advisories/new>). Only the maintainer can see the report.

Please include:

- what the issue is and what an attacker could do with it
- steps to reproduce, or a proof of concept
- the affected route, file or commit, if you know it

You should get a reply within 7 days. Once a fix is deployed, the advisory is published, with credit to you unless you'd rather stay anonymous.

## Scope

In scope: this repository's code and the hosted instance at <https://travel.kuzio.app>.

Please test only against your own account and data. Don't access other users' data, degrade the service (no load or denial-of-service testing), or use social engineering.

Vulnerabilities in third-party services (GitHub, Cloudflare, MapTiler, Nominatim, Sentry) should be reported to those vendors.

## Supported versions

Only the latest commit on `main`, which is what's deployed, gets security fixes.
