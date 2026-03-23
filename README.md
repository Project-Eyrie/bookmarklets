<div align="center">

# OSINT Bookmarklets

> A collection of browser bookmarklets for open-source intelligence gathering across social media platforms.


[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![In Project Eyrie](https://img.shields.io/badge/IN-PROJECT%20EYRIE-b45309?style=for-the-badge&labelColor=0f172a)](https://github.com/Project-Eyrie)
![WEB](https://img.shields.io/badge/TYPE-WEB-0369a1?style=for-the-badge&labelColor=0f172a)

</div>

---

## Overview

**OSINT Bookmarklets** is a set of 25 browser bookmarklets built for researchers and analysts. It extracts hidden metadata, timestamps, and user information from social media platforms by parsing page source, querying platform APIs, and decoding embedded data structures.

---

## Features

- **Platform Coverage** - Bookmarklets for Instagram, Facebook, X, YouTube, Reddit, TikTok, Snapchat, Threads, and Google Maps
- **Timestamp Extraction** - Reveals exact dates in local, UTC, ISO, and Unix formats with relative age
- **Profile Intelligence** - Extracts user IDs, account ages, karma breakdowns, and image URLs not visible in the UI
- **General Utilities** - Page-wide image discovery, word frequency analysis, text search, and Wayback Machine lookup

---

## How to Use

### About the Tool

Each bookmarklet runs as a self-contained script in the browser. When activated on a supported page, it opens a draggable overlay window displaying extracted data. No data leaves the browser and nothing is stored.

### Installation

**Drag from the website** - Visit [bookmarklets.notalex.sh](https://bookmarklets.notalex.sh) and drag any link to your bookmarks bar.

**Import all bookmarklets** - Download [`bookmarks.html`](https://github.com/notalex-sh/osint-bookmarklets/raw/main/dist/bookmarks.html) and import it into your browser (**Bookmarks > Import Bookmarks from HTML file**). All 25 bookmarklets will be added in an **OSINT Bookmarklets** folder organized by platform.

**Copy and paste** - Pre-minified `javascript:` URIs are in [`dist/bookmarklets/`](https://github.com/notalex-sh/osint-bookmarklets/tree/main/dist/bookmarklets). Create a new bookmark and paste the contents as the URL.

**Convert yourself** - The un-minified source files are in `bookmarklets/`. Convert them to bookmarklets at [markletsmith.notalex.sh](https://markletsmith.notalex.sh).

### Bookmarklets

#### Instagram

| Bookmarklet | Description |
|---|---|
| **Instagram ID** | Extract numeric user ID, username, and display name from a profile page |
| **Instagram Post Timestamp** | Show the exact date and time for an opened post, reel, or story |
| **Instagram Comment Timestamps** | Expand all comments and add inline timestamp badges |
| **Instagram to Threads** | Open the Threads profile for the current Instagram user |
| **Instagram Collab Finder** | List tagged users and collaborators on recent posts |
| **Instagram HD Profile Pic** | Fetch and display the HD profile picture for an Instagram user |

#### Facebook

| Bookmarklet | Description |
|---|---|
| **Facebook ID** | Extract profile ID, username, and display name from a profile page |
| **Facebook Marketplace** | Extract user ID and open their Marketplace seller page |
| **Facebook Listing Timestamp** | Show the exact date a Marketplace listing was created |
| **Facebook Expand Comments** | Switch to "All comments", expand every comment, reply, and "See more" |
| **Facebook Profile Search** | Extract user ID and search their profile using their first name |

#### Google

| Bookmarklet | Description |
|---|---|
| **Google Review Timestamp** | Extract the exact creation and modification date of a Google Maps review |

#### Reddit

| Bookmarklet | Description |
|---|---|
| **Reddit Account Info** | Fetch account creation date, age, karma breakdown, and flags |
| **Reddit Arctic Shift** | Open the current user on Arctic Shift to search their post history |

#### Snapchat

| Bookmarklet | Description |
|---|---|
| **Snapchat Timestamps** | Add timestamp badges to Spotlight and Story tiles on a profile page |

#### Threads

| Bookmarklet | Description |
|---|---|
| **Threads ID** | Extract numeric user ID and username from a profile |

#### TikTok

| Bookmarklet | Description |
|---|---|
| **TikTok Video Timestamp** | Extract upload timestamp from a video ID using Snowflake decoding |

#### X (Twitter)

| Bookmarklet | Description |
|---|---|
| **X Profile Info** | Extract user ID, creation date, banner and profile image URLs |

#### YouTube

| Bookmarklet | Description |
|---|---|
| **YouTube Channel Info** | Extract channel ID, handle, subscriber count, and join date |
| **YouTube Video Timestamp** | Show exact upload date and time for a video, short, or live stream |

#### General Tools

| Bookmarklet | Description |
|---|---|
| **Last Modified** | Show the document.lastModified date for the current page |
| **All Images** | Find and list every image on the page, including CSS backgrounds |
| **Find on Page** | Search with highlighted matches and a clickable results list |
| **Word Frequency** | Count and rank every visible word on the page by frequency |
| **Wayback Machine** | Open the current page on the Wayback Machine |

---

## Theory and Background

### Core Concept

These bookmarklets exploit the fact that web applications embed far more data in the page than they display to the user. Social media platforms load user IDs, precise timestamps, and metadata into the DOM, inline scripts, and `__NEXT_DATA__` payloads for their own rendering logic. By parsing `document.documentElement.innerHTML`, querying undocumented API endpoints (Instagram's `web_profile_info`, Reddit's `about.json`), and decoding platform-specific formats (TikTok's Snowflake IDs, Google Maps' `APP_INITIALIZATION_STATE`), the bookmarklets surface information that is present in the browser but hidden from the interface.

---

## Notes

- **Browser support** - Tested on Chrome and Firefox; other browsers may have varying support for bookmarklet execution
- **Rate limiting** - Some bookmarklets make API requests (Instagram, Reddit) and may be rate limited if used repeatedly in quick succession
- **Dynamic pages** - Bookmarklets that parse HTML source may need a page refresh on SPAs where content loads after initial render
- **Private accounts** - Instagram bookmarklets will have limited data access on private profiles unless the account is followed

---

<div align="center">
  Part of Project Eyrie - by <a href="https://notalex.sh">notalex.sh</a>
</div>
