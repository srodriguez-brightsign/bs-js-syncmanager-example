# JavaScript syncmanager API
https://docs.brightsign.biz/space/DOC/420217068/syncmanager

## Tested with:

- LS425, OS 9.0.208 as Leader
- LS445, OS 9.0.208 as Follower

## Caveats:

- When playing the first video in the list and the leader is rebooted, the follower will play through the end of the video and stop there. Once the leader finishes booting, the follower won't catch up to the leader until the next video in the list plays.
  - I added code to work around this as noted in the JavaScript comments.
- A synchronize event is triggered every second but the iso_timestamp won't update accordingly; the videos do stay synchronized.

Waiting on OS-18112 to retest the above scenarios

## How to use:

- Save `autorun.brs`, `index.html`, and `index.js` to blank SD card.
- Create a `videos` folder in the root of the SD card. Add videos in the supported format(s). https://docs.brightsign.biz/space/DOC/420217068/syncmanager#synchronize()
- To set up a follower, change the very first line of the code to `let isLeader = false;`
