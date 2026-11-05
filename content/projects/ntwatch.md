---
name: ntwatch
desc: packets and processes - wireshark + nettop
order: 1
favorite: true
tags:
  - golang
  - c
links:
  gh: 'https://github.com/lolasanchezz/ntwatch'
  demo: 'https://github.com/lolasanchezz/ntwatch/releases/tag/v0.3.5'
images:
  - src: design.png
    subtitle: system design
    asp: 0.7
  - src: ntwatch.gif
    subtitle: first working version - sockets and packets
    asp: 0.8
  - src: Screenshot-2026-11-04-at-12.58.23-AM.png
    subtitle: ntwatch gui version!!!!!!!
    asp: 0.71
---
## Summary

A tool to track internet usage through live packet capture and socket analysis/process analysis.

## Inspiration

I was initially inspired by wireshark - an app that, although extremely practical, is very myopic in its presentation of data. While packets can be sorted, it takes extra work to extrapolate patterns about network traffic. While knowing specific packet data could be useful, I wanted to know broader information about the behavior of all the processes on my computer to detect malware, bugs, or abnormal patterns in network traffic. I found myself using nettop right next to wireshark to match packets to processes, which inspired me to make ntwatch - a combination of processes and packets.

i also read the unix whitepaper over the summer, and thought the networking stack / socket idea was pretty cool. so i wanted to get my hands dirty in some sockets!

# ¶ development - main branch

## v0.35

I first started by exploring existing go libraries to read socket data. I wanted to do it as low level and efficient as possible, as I knew I would be examining sockets alongside packets, which would come in extremely quickly and in huge amounts. AKA, no exec calls of lsof. However, existing go-socket libraries for macos were incomplete and buggy. While I might attempt to fix such libraries in the future, at the beginning, I really just wanted to get a working prototype going. Therefore, my first goal was to access socket data through go with c's libproc, a macos provided c library to access proc(ess) data. That's why the first version (aka v0.5), pictured above, is a go program with bubbletea displaying all socket information through cgo. In all, this part was the hardest - it was a lot of research into libproc, a barely used library, and on what socket struct values actually mean, considering macos provides very little documentation. In all, I ended up with a prettier version of nettop/netstat, which was already an accomplishment in and of itself. I ended up submitting v0.5 as a project for Hack Club's Athena Award.

## v1.0

After ensuring I could access sockets through go in v0.5, I started on progressing towards the full version of ntwatch, which would display packets alongside processes. I decided on the above design, facilitating communication between the packet collection process and the cgo socket reading through bubbletea's cmds. I wanted to keep the two processes completely seperate and have them constantly running asynchronously, in order to recieve packets and sockets as quickly as possible. I came up with a simple matching process to match sockets and packets by just matching those which had the same listening/outgoing ip, process name, and source/destination port. While the GUI still needs work, the core functionality is done.

---

# ¶ wails branch 
almost a year later, i decided to revitalize the project because i was talking about it so much. 

### *what i learned from research*
i started poking around at it with my new claude subscription, and learned a few things - 

1. on macos tahoe, the macos version i was running on my new computer without ntwatch, nettop actually pulls from the network statistics private framework which already tracks flows end to end. so no more assembling packet flows! yay!!


2. another benefit of using network statistics is that it shows flows belonging to processes invisible to lsof. apps built on xcode, apple apps, and macos system processes (daemons, etc) use the framework **network.framework** for networking. it's pretty much a c api with swift wrappers, so it's really easy for macos apps to use. 

however, it *doesn't use sockets*.

i was pretty shocked to see this - in the original whitepaper, sockets are the main way to recieve external network packets in unix. but unbeknowest to me, macos has implemented this 'skywalk' protocol in the kernel that literally just copies packets from the network card into buffers in the process - no processing, no removal of headers whatsoever. just raw network bytes into (usually) a ring buffer. so no socket intermediary between the network card and the process and its direct memory/instructions! crazy! it's actually inspired by netmap, a protocol implemented on unix/freebsd in 2011 - just kind of throwing away the socket. 

anyways, when i read into networkstatistics directly, which showed all network flows **already** associated with processes, i was able to pick up packets handled by skywalk/not delivered to sockets. so a whole new world of packets opened! especially system/macos app sockets!

---

### - *actual design / development*

annnnyways, after i figured out all those tedious network things and a few other tiny bugs, i was able to make a gui with [wails](https://wails.io/) - a desktop application framework for go! it's an electron-esque app framework for go, with the same client-server framework as web servers - the server, in this case, would be the current extended ntwatch, and the client would be a dashboard view of the information collected by ntwatch. ntwatch neatly puts together processes and packets on the server, then sends it over to the dashboard to do whatever with it.

however, there was a problem - ntwatch was originally designed with [bubbletea](https://github.com/charmbracelet/bubbletea), which follows the [elm architecture](https://guide.elm-lang.org/architecture/), a purely functional architecture. that's why bubbletea has a weird system of sending messages between functions - nothing is asynchronous, so when you need to call long, stalling functions, instead of blocking bubbletea's tui completely and getting rid of a snappy tui, you call a goroutine and recieve data back from it. 

it's pretty elaborate, but was extremely inspiring for designing ntwatch, which also had to be snappy and call io heavy goroutines (reading all packets and processes). but there was no reason to keep bubbletea around if i was getting rid of the terminal ui and using wails for everything. so i had to figure something else out to replace the bubbletea engine.

ultimately, i ended up keeping the design similar and having a small engine.go file that replicated the behavior of bubbletea's engine - passing messages between goroutines, keeping a main source of truth, etc. ntwatch now just didn't output anything to a terminal ui and sent over all its data every 100ms in batches. ![](/images/ntwatch/Screenshot-2026-11-04-at-12.58.23-AM.png) the new guy!

and that's it for the wails branch.


---


# ¶ what ntwatch taught me
### 1
![](/images/ntwatch/Screenshot-2026-11-04-at-1.05.32-AM.png)

macos sends a LOT of network activity to your phones and desktops on your local network! stuff from handoff to airplay to just weird undisclosed communication. and some of it is unencrypted. 

here you can see my computer talking to both my phone (phone-3), my friend's phone (lelas-iphone), and probably another computer with a local ip. and i'm doing nothing related to the sort. 
### 2
![](/images/ntwatch/Screenshot-2026-11-04-at-1.08.50-AM.png)

granola, the meeting transcription app, is CONSTANTLY connected to the internet and always recieving a lot of data even when it's idle/no meetings are running. even when the app is closed. it's really weird and kind of spyware-esque.


after working on ntwatch for a while, at calhacks, i became inspired by ntwatch and made a much more powerful, prettier sister - [*ultimate packet inspector*](/projects/ultimate-packet-inspector).
