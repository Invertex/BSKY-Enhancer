# BSKY-Enhancer
QoL improvements for BSKY, including media download, higher quality playback, attribution in filenames and much more!

## Installation:
Install a userscript addon for your browser, preferably [TamperMonkey](https://www.tampermonkey.net/).</br>
Then [click here](https://github.com/Invertex/BSKY-Enhancer/raw/main/bsky_enhancer.user.js), or open the RAW of `bsky_enhancer.user.js` in this repository.

## FEATURES:
- Source-quality video playback. `(Won't work on Chrome due to lacking functionality, but highest-quality stream will play instantly!)`
- Download video button below posts.
- Custom context menu on media for interacting with the source-quality content
- Saves files with proper attribution e.g: `didplc-ewm2epvgjd5prkys3w3oh37k_(invertex.xyz)_2024-11-22_3lbltee7tz62n_1.jpg`
  - So files are User & Date sorted. Contains Post-ID to find that post on their account again too!
  - And includes user's "DID" so they can be found even if their Handle/Username changes!
- Adds a "Copy Link" button below media posts to automatically copy it as a `bskyx.app` link, so the video will embed properly when pasted elsewhere.
- Hidden "tags" show on the post! (third-party apps like deck.blue allow you to make posts with the tags hidden in the data)
- Plus-Icon shown on avatars if you don't follow the user. (Just like on Mobile).

![](https://i.imgur.com/nv8k9dV.png)
[<img src="https://i.imgur.com/keJqWPD.png">](https://bsky.app/profile/invertex.xyz/post/3lig6enxj6s2d)
>(Future improvements to come. May add timeline width adjustment at some point as well.)


## Video Quality Comparison:
Original           |  BSKY-Enhancer
:-------------------------:|:-------------------------:
![](https://i.imgur.com/zjKzXNr.png)  |  ![](https://i.imgur.com/1kc1nbE.png)
