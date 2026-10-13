# Privacy policy

_Last updated: 13 October 2026_

This policy covers the hosted Travel Log app at <https://travel.kuzio.app>, which is run by Oliver Kuzio ("I", "me"). If you run your own copy of the code, you are responsible for your own users' data, and this policy doesn't apply to it.

Travel Log is a personal project. It has no ads, sells no data, and does no tracking or analytics beyond the error monitoring described below.

**Contact:** <!-- TODO: add a privacy contact email before inviting public users --> [privacy contact email]

## What is stored

| Data                                                              | Where it comes from             | Why                                                                                                                                                           |
| ----------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Your name, email address and avatar URL from GitHub               | Signing in with GitHub          | To create your account and show who's signed in                                                                                                               |
| Your GitHub account id and OAuth tokens                           | Signing in with GitHub          | To link sign-ins to your account. The app only asks GitHub for your profile and email address (`read:user`, `user:email`) and can't access your repositories. |
| Session records, including your IP address and browser user agent | Each sign-in                    | To keep you signed in and let sessions be tied to a device                                                                                                    |
| Locations, trips, visit logs, notes and dates                     | What you enter                  | This is the app                                                                                                                                               |
| Photos                                                            | What you upload                 | Shown on your locations, visits and trips. They are resized on your device before upload.                                                                     |
| Google Maps links and place details                               | Google Takeout files you import | To turn saved places into locations                                                                                                                           |

Everything you create is private to your account. The server checks ownership on every request, including for photos.

## On your device

So the app works offline, your browser keeps copies of pages, your data and your photos (Cache Storage), plus changes you've made offline that haven't synced yet (IndexedDB). **Signing out deletes these**, including unsynced changes (the app asks you to confirm first). Your light/dark theme choice is kept in local storage.

## Services that process data

| Service                                              | What it receives                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cloudflare** (hosting, database and photo storage) | Everything above. Photos are stored in Cloudflare R2 in the EU jurisdiction. Cloudflare also processes request logs as part of running the service.                                                                                                                                                                                                              |
| **GitHub** (sign-in, map icons)                      | That you signed in to Travel Log. Your browser also loads the map's icons from `openmaptiles.github.io`, so GitHub sees your IP address.                                                                                                                                                                                                                         |
| **MapTiler** (map tiles and fonts)                   | Your browser loads map tiles directly from MapTiler, so MapTiler sees your IP address and the map areas you view                                                                                                                                                                                                                                                 |
| **OpenStreetMap Nominatim** (place search)           | The search text you type. Searches go through the Travel Log server, so Nominatim doesn't see your IP address.                                                                                                                                                                                                                                                   |
| **Sentry** (error monitoring)                        | Details of errors and a sample of performance data: the page address without its query string, browser and OS, and the error itself. IP addresses, cookies and request bodies are not sent. For a quarter of errors in the browser, a short replay of the moments before the error is recorded, with **all text and form inputs masked and all images blocked**. |

## How long data is kept

Your account and content are kept until you delete them or ask for your account to be deleted. Deleting a location, trip or photo in the app removes it straight away. Sessions expire after 7 days without use. Sentry keeps error events for the retention period of the Sentry plan in use, then deletes them.

## Your rights

You can view, edit and delete your content in the app at any time. To get a copy of your data, or to have your account and everything in it deleted, contact me at the address above. If you are in the EU or UK, you also have the right to object to or restrict processing, and to complain to your data protection authority.

The legal basis for processing is performing the service you signed up for (your account and content) and legitimate interest (keeping the service secure and fixing errors).

## Changes

Changes to this policy are made in this file, so its [history](https://github.com/oliverkuzio/travel-log/commits/main/PRIVACY.md) shows what changed and when.
