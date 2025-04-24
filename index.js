let isLeader = true; // Update me

const videos = [];
let currentVideoIndex = 0;
populateVideosArray();
let lastIsoTimestamp;

const videoPlayer = document.getElementById("video1");

let domain = "brightsign";
let dest_ip = "239.0.0.1";
let dest_port = 5004;

const SyncManager = require("@brightsign/syncmanager");
let sync = new SyncManager("", domain, dest_ip, dest_port);

sync.leader = isLeader;
sync.encrypted = false;

if (sync.leader) {
  console.log("@@@ I'm the leader");
  videoPlayer.addEventListener("ended", playNextVideo);

  sync.addEventListener("syncevent", leaderSyncevent);

  playNextVideo();
} else {
  console.log("@@@ I'm the follower");

  sync.addEventListener("syncevent", followerSyncevent);
}

function playNextVideo() {
  console.log("@@@ Leader playing: " + videos[currentVideoIndex]);

  videoPlayer.src = "";
  videoPlayer.src = videos[currentVideoIndex];
  videoPlayer.play().catch((err) => console.log("@@@ Video play error:", err));

  // Passing the leader's video player src attribute as the 'id' so the followers can update their own video player src attribute
  sync.synchronize(videoPlayer.src, 0);
  currentVideoIndex = (currentVideoIndex + 1) % videos.length;
}

function leaderSyncevent(e) {
  console.log("@@@ syncevent: " + JSON.stringify(e)); // Delete me to keep system log from flooding with entries

  videoPlayer.setSyncParams(e.domain, e.id, e.iso_timestamp);
}

function followerSyncevent(e) {
  console.log("@@@ syncevent: " + JSON.stringify(e)); // Delete me to keep system log from flooding with entries

  // Updating follower's video player src attribute using 'id' sent by leader
  // You'll want to make sure the same file path exists on both leader and follower(s)
  if (videoPlayer.src !== e.id) {
    console.log("@@@ Leader playing: " + e.id);
    videoPlayer.src = "";
    videoPlayer.src = e.id;
    lastIsoTimestamp = e.iso_timestamp;
  }

  // These two scenarios should technically be handled automatically by the syncmanager API, waiting on a new firmware release to test again.
  // Scenario 1:
  // Leader is rebooted and follower doesn't automatically sync with the leader causing the follower to reach the end of the video.
  //  The code forces the video player to reload because it's still receiving the same video identifier from the leader.
  if (videoPlayer.ended && videoPlayer.src === e.id) {
    console.log(
      "@@@ Follower reached end of the video and is still receiving the same video source identifier from the leader, reloading..."
    );
    lastIsoTimestamp = e.iso_timestamp;
    videoPlayer.load();
  }

  // Scenario 2:
  // Leader is rebooted and sends the same video identifier as the follower's video player src but a different timestamp from what the follower stores in lastIsoTimestamp set above.
  //  This timestamp should update every time it is sent but it is currently not so I am using this information to force a reload.
  if (videoPlayer.src === e.id && e.iso_timestamp !== lastIsoTimestamp) {
    console.log(
      "@@@ Leader restarted video playback and its timestamp changed but it's playing the same video as the follower, reloading..."
    );
    lastIsoTimestamp = e.iso_timestamp;
    videoPlayer.load();
  }
  // End scenarios

  // This is actually required
  videoPlayer.setSyncParams(e.domain, e.id, e.iso_timestamp);
}

function populateVideosArray() {
  const defaultStorage = "/storage/sd/";
  const videosFolder = "videos/";
  const videoExtensions = ["mov", "mp4"]; // https://docs.brightsign.biz/space/DOC/420217068/syncmanager#synchronize()

  let fs = require("fs");
  let files = fs.readdirSync(defaultStorage + videosFolder);

  files.forEach((file) => {
    let fileExt = file.split(".").pop();
    fileExt = fileExt.toLowerCase();
    if (file[0] !== "." && videoExtensions.includes(fileExt)) {
      videos.push(videosFolder + file);
    }
  });

  videos.sort();

  if (videos.length === 0) {
    console.log("@@@ No videos found in " + defaultStorage + videosFolder);
  }
}
