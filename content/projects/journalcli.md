---
name: journalcli
desc: an encrypted journal in the terminal
order: 4
favorite: false
tags:
  - golang
  - cli
links:
  gh: 'https://github.com/lolasanchezz/journalcli'
  demo: 'https://github.com/lolasanchezz/journalcli/releases/tag/main'
images:
  - src: final.gif
    subtitle: in action!
    asp: 0.7
---
## Summary

an encrypted journal through the terminal!

## Inspiration

I wanted a journaling app that would be discrete, extremely straightforward without bugs or distractions, and secure to onlookers. Most journaling apps I found were too complex, making journaling a task instead of a sidenote about the day. Journaling apps were about flashy features, not just journaling, which discouraged me to journal. So I decided to make a journaling cli in the terminal - the most straightforward interface you can get.

## Overview

While this journaling cli doesn't exactly offer anything technologically novel, it excels in its aesthetic and simplicity. At the end of the day, I just wanted a journaling app that would be encrypted, work well, and encourage me to journal. Its main features are past journal viewing, analytics (word count per entry, etc), and searchable entries through filtering. There was a lot of work that went into this app that's un-noticeable - smooth scrolling, keybinds, constantly updating configuration, etc - which is the hallmark of a well designed UI/UX. Each 'page' of the website has its own component and styling, and every journal entry is AES encrypted. Journal entries can even be edited after being made. This project was tedious, but worth it - it's a clean journaling app that I actually use.
