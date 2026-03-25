<div align="center">

<img src="logo.png" alt="OSINT Bookmarklets" width="128" />

# OSINT Bookmarklets

> A collection of browser bookmarklets for open-source intelligence gathering across social media platforms.


[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![In Project Eyrie](https://img.shields.io/badge/IN-PROJECT%20EYRIE-b45309?style=for-the-badge&labelColor=0f172a)](https://github.com/Project-Eyrie)
![WEB](https://img.shields.io/badge/TYPE-WEB-0369a1?style=for-the-badge&labelColor=0f172a)

</div>

---

## Overview

**OSINT Bookmarklets** is a set of browser bookmarklets built for researchers and analysts. It extracts hidden metadata, timestamps, and user information from social media platforms by parsing page source, querying platform APIs, and decoding embedded data structures.

The website at [bookmarklets.notalex.sh](https://bookmarklets.notalex.sh) automatically discovers all bookmarklets from this repository, fetches the source code, and converts them to draggable `javascript:` links using [Markletsmith](https://markletsmith.notalex.sh). No build step is required — just add a `.js` file to `bookmarklets/` and the website picks it up.

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

**Convert yourself** - The un-minified source files are in `bookmarklets/`. Convert them to bookmarklets at [markletsmith.notalex.sh](https://markletsmith.notalex.sh).


### Overlay Window Template

All bookmarklets use a consistent draggable overlay window. This is the template used when creating a new bookmarklet:

```js
// title: "Example Tool"
// description: "Description of what this does"
(function() {

  var existing = document.getElementById('_osint_win');
  if (existing) existing.remove();

  var win = document.createElement('div');
  win.id = '_osint_win';
  win.style.cssText = [
    'position:fixed',
    'top:48px',
    'right:48px',
    'width:420px',
    'max-height:70vh',
    'background:#0a0a0a',
    'border:1px solid #222',
    'color:#eee',
    'font-family:"SF Mono","Cascadia Mono","Fira Mono",Consolas,monospace',
    'font-size:12px',
    'z-index:2147483647',
    'display:flex',
    'flex-direction:column',
    'box-shadow:0 0 0 1px #000'
  ].join(';');

  var bar = document.createElement('div');
  bar.style.cssText = [
    'display:flex',
    'align-items:center',
    'justify-content:space-between',
    'padding:8px 12px',
    'background:#000',
    'border-bottom:1px solid #222',
    'cursor:grab',
    'user-select:none',
    '-webkit-user-select:none'
  ].join(';');

  var titleEl = document.createElement('span');
  titleEl.textContent = 'WINDOW TITLE';
  titleEl.style.cssText = 'font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#777';

  var closeBtn = document.createElement('button');
  closeBtn.textContent = '\u00d7';
  closeBtn.style.cssText = 'background:none;border:none;color:#777;font-size:18px;cursor:pointer;padding:0;line-height:1;font-family:inherit';
  closeBtn.onmouseover = function() { closeBtn.style.color = '#fff'; };
  closeBtn.onmouseout = function() { closeBtn.style.color = '#777'; };
  closeBtn.onclick = function() { win.remove(); };

  bar.appendChild(titleEl);
  bar.appendChild(closeBtn);

  var body = document.createElement('div');
  body.style.cssText = 'overflow-y:auto;padding:12px';

  win.appendChild(bar);
  win.appendChild(body);

  var dx = 0, dy = 0, sx = 0, sy = 0;
  bar.onmousedown = function(e) {
    e.preventDefault();
    sx = e.clientX;
    sy = e.clientY;
    bar.style.cursor = 'grabbing';
    document.onmousemove = function(e) {
      dx = sx - e.clientX;
      dy = sy - e.clientY;
      sx = e.clientX;
      sy = e.clientY;
      win.style.top = (win.offsetTop - dy) + 'px';
      win.style.left = (win.offsetLeft - dx) + 'px';
      win.style.right = 'auto';
    };
    document.onmouseup = function() {
      document.onmousemove = null;
      document.onmouseup = null;
      bar.style.cursor = 'grab';
    };
  };

  document.body.appendChild(win);

  // Add your content to `body` here

})();
```

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

- **Browser support** - Tested on Edge and Firefox; other browsers may have varying support for bookmarklet execution
- **Rate limiting** - Some bookmarklets make API requests (Instagram, Reddit) and may be rate limited if used repeatedly in quick succession
- **Dynamic pages** - Bookmarklets that parse HTML source may need a page refresh on SPAs where content loads after initial render
- **Private accounts** - Instagram bookmarklets will have limited data access on private profiles unless the account is followed

---

<div align="center">
  Part of Project Eyrie - by <a href="https://notalex.sh">notalex.sh</a>
</div>
