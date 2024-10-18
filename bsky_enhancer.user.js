// ==UserScript==
// @name         BSKY Enhancer
// @namespace    Invertex.BSKY
// @version      0.19
// @description  Quality of life improvements for BSKY
// @author       Invertex
// @updateURL    https://github.com/Invertex/BSKY-Enhancer/raw/main/bsky_enhancer.user.js
// @downloadURL  https://github.com/Invertex/BSKY-Enhancer/raw/main/bsky_enhancer.user.js
// @match        https://bsky.app/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bsky.app
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        navigation
// @grant        unsafeWindow
// @run-at       document-start
// @require      https://github.com/Invertex/Invertex-Userscript-Tools/raw/f8b74b4238884620734e5d813070135bd224e7ae/userscript_tools.js
// ==/UserScript==

addGlobalStyle(`svg.vxDlSVG > path {
    fill: rgba(255, 255, 255, 0.5);
}`);

(async function() {
    'use strict';
    let root = await awaitElem(document, '#root', argsChildAndSub);
    let vids = root.querySelectorAll('div[data-testid^="feedItem-"] video,div[data-testid^="postThreadItem-"] video');
    vids.forEach(processVidElem);
    watchForAddedNodes(root, false, { attributes: false, childList: true, subtree: true }, onNodesAdded);
})();

function doOnAttributeChange2(elem, onChange, repeatOnce = false)
{
    let rootObserver = new MutationObserver((mutes, obvs) => {
        obvs.disconnect();
        onChange(elem);
        if (repeatOnce == true) { return; }
        obvs.observe(elem, { childList: false, subtree: false, attributes: true })
    });
    rootObserver.observe(elem, { childList: false, subtree: false, attributes: true });
}

function vidForceHQ(vidElem)
{
    let linksplit = vidElem.poster.split('/');
    for(let i = 1; i < linksplit.length; i++)
    {
        let linkpart = linksplit[i];
        if(linkpart.includes('did%3Aplc'))
        {
            let did = linkpart;
            let cid = linksplit[i + 1];
            vidElem.preload = true;
            let hqURL = getVideoUrl(did,cid);
            vidElem.src = hqURL;

            break;
        }
    }
    let postitem = vidElem.closest('div[data-testid^="feedItem-"],div[data-testid^="postThreadItem-"]');
    processPostItem(postitem);
}

function onNodesAdded(nodes)
{
    if (nodes.length == 0) { return; }
    for(let i = 0; i < nodes.length; i++)
    {
        let child = nodes[i];
        if(child != null)
        {
            let vid = child?.querySelector('video');
            if(vid)
            {
                processVidElem(vid);
            }
        }
    }
}

function processVidElem(vid)
{
    if(addHasAttribute(vid, "bskyHD")) { return; }
    vidForceHQ(vid);
    doOnAttributeChange2(vid, vidForceHQ);
}

async function processPage(){
    processPostThread();
     let feeditem = await awaitElem(document.body, `#root div:has(> div[class^="css-"] > div > div[data-testid^="feedItem-"])`, argsAll);

    let feeds = document.body.querySelectorAll('div[data-testid*="feed-flatlist" i]');

    feeds.forEach(watchForFeedContent);

    let profile = await awaitElem(document.body, `#root div[data-testid="profileView"] > div:has(div[class^="css-"] > div > div[data-testid^="feedItem-"])`, argsAll);
    watchForAddedNodes(profile, false, argsChildOnly, (addedFeeds)=>addedFeeds.forEach(watchForFeedContent));
}

async function processPostThread()
{
    if(!window.location.href.includes('/post/')) { return; }

    let postThread = await awaitElem(document.body, '#root div:has(> div[class^="css-"] > div > div[data-testid^="postThreadItem-"])', argsChildAndSub);
    processFeed(postThread);
}

async function watchForFeedContent(feedContainer)
{
    let stuff = await awaitElem(feedContainer, `div[data-testid^="feedItem-"],div[data-testid^="postThreadItem-"]`, argsAll);
    let feed =await awaitElem(feedContainer, `div:has(> div[class^="css-"] > div > div[data-testid^="feedItem-"]),div:has(> div[class^="css-"] > div > div[data-testid^="postThreadItem-"])`);
    processFeed(feed);
}

async function processFeed(feed)
{
    if(addHasAttribute(feed, "bskyENFeedWatch")) { return; }

    processFeedPosts(feed.childNodes);
    watchForAddedNodes(feed, false, argsChildOnly, processFeedPosts);
}

function processFeedPosts(posts)
{
    if (posts.length == 0) { return; }
    posts.forEach((post) =>
    {
        processPost(post);
    });
}

async function processPostItem(post)
{
    if(!post || addHasAttribute(post, "bskyEN")) { return; }
    let vid = await awaitElem(post, 'figure > video[poster^="https://video.bsky"],video[src*=".webm"],video[src*=".mp4"]', argsChildAndSub);
    if(vid == null) { return; }

    let buttonBar = await awaitElem(post, 'div:has(> div > div[data-testid="likeBtn"])', argsChildAndSub);

    let dlBtn = createDLButton();
    dlBtn.onclick = (e) => {
        e.stopPropagation();
        if(dlBtn.hasAttribute('downloading')) { return; }
        dlBtn.setAttribute('downloading', '');
        downloadPostVid(post, vid, dlBtn);
    };
    buttonBar.appendChild(dlBtn);
}

async function processPost(post)
{
    if(!post || addHasAttribute(post, "bskyEN")) { return; }
    post = await awaitElem(post, '[data-testid^="feedItem-"],div[data-testid^="postThreadItem-"]', argsChildAndSub);
    await processPostItem(post);
}

function downloadPostVid(post, vidElem, dlBtn)
{
    let postInfo = post.querySelector('a[href*="/post/"][role="link"]');
    let saveData = postInfo != null ? getSaveDataFromPostInfo(postInfo) : getSaveDataFromPost(post);
    let vidUrl = vidElem.src;

    if(vidElem?.poster && vidElem.poster.includes('did%3Aplc'))
    {
        let posterParts = vidElem.poster.split('/watch/')[1].split('/');
        let did = posterParts[0].replace('%3A',':');
        let cid = posterParts[1];
        vidUrl = getVideoUrl(did, cid);
    }

    let filename = `${saveData.username}_${saveData.date}_${saveData.postID}.mp4`;
    download(vidUrl, filename).then(() => { console.log("done"); removeButtonEffect(dlBtn); }).catch(() => { removeButtonEffect(dlBtn); }, 20000);
}

function getSaveDataFromPostInfo(postInfo)
{
    let link = postInfo.href;
    let date = postInfo.getAttribute('data-tooltip');
    date = formatFilenameDate(date);
    let splitLink = link.split('/profile/')[1].split('/post/');
    let username = splitLink[0];
    let postID = splitLink[1];
    if(!username.endsWith('bsky.social')) { username += '_(BSKY)'; }
    return {username: username, date: date, postID: postID };
}
function getSaveDataFromPost(post)
{
    let date = post.querySelector('div:has(> button[aria-label="Who can reply"]) > div')?.innerText;
    date = formatFilenameDate(date);
    let url = window.location.href.split('/post/');
    let username = "";
    let postID = "";
    if(url.length > 1)
    {
        username = url[0].split("/profile/")[1];
        postID = url[1];
    }
    if(username == "")
    {
        let userlink = post.querySelector('a[href*="/profile/"]');
        if(userlink) { username = userlink.href.split('/profile/')[1] }
    }

    return {username: username, date: date, postID: postID};
}

function formatFilenameDate(date)
{
    date = date.replace(' at',',');
    let isoDate = new Date(date);
    return isoDate.toISOString("YYYY-MM-DD").split('T')[0];
}

// Thanks to `https://github.com/FerroEduardo/bskye` for this nifty little API call info
function getVideoUrl(authorDid, videoCid) {
  const randomNumber = Math.floor(Math.random() * 100); // Prevent Discord ban/rate limit video
  return `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${authorDid}&cid=${videoCid}&r=${randomNumber}`;
}

function removeButtonEffect(dlBtn)
{
    if(dlBtn?.hasAttribute('downloading')) { dlBtn.removeAttribute('downloading'); }
}

const filterVideoSources = function (m3u8)
{
    const bandwidth_regex = /(?<=,BANDWIDTH=)([0-9]*)(?=,)/gm;
    let bestLine = 0;
    let bestBitrate = 0;
    let new_playlist = "";

    let lines = m3u8.split('#');


    for (let i = 1; i < lines.length; i++)
    {
        let line = lines[i];

        if (line.includes('STREAM-INF:'))
        {
            let bitrate = parseInt(line.match(bandwidth_regex));
            if (bitrate > bestBitrate)
            {
                bestBitrate = bitrate;
                bestLine = i;
            }
        }
        else
        {
            new_playlist += '#' + line;
        }
    }

    if (bestLine == 0)
    {
        bestLine = Math.max(0, lines.length - 1);
    }

    new_playlist += '#' + lines[bestLine];

    return new_playlist;
};

function processXMLOpen(thisRef, method, url)
{
    return;
    if (url.includes('playlist.m3u8'))
    {
        thisRef.addEventListener('readystatechange', function (e)
        {
            const m3uText = e.target.responseText;
            if(m3uText.includes('#EXT-X-STREAM-INF'))
            {
                let m3u = filterVideoSources(m3uText);
                Object.defineProperty(thisRef, 'response', { writable: true });
                Object.defineProperty(thisRef, 'responseText', { writable: true });
                thisRef.response = thisRef.responseText = m3u;
            }
        });
    }
}


//Intercept video playlist response so we can modify it
var openOpen = unsafeWindow.XMLHttpRequest.prototype.open;
unsafeWindow.XMLHttpRequest.prototype.open = exportFunction(function(method, url)
{
    processXMLOpen(this, method, url);
    openOpen.call(this, method, url);
}, unsafeWindow);
