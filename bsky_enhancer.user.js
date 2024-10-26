// ==UserScript==
// @name         BSKY Enhancer
// @namespace    Invertex.BSKY
// @version      0.23
// @description  Quality of life improvements for BSKY
// @author       Invertex
// @updateURL    https://github.com/Invertex/BSKY-Enhancer/raw/main/bsky_enhancer.user.js
// @downloadURL  https://github.com/Invertex/BSKY-Enhancer/raw/main/bsky_enhancer.user.js
// @match        https://bsky.app/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bsky.app
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_setClipboard
// @grant        unsafeWindow
// @run-at       document-start
// @require      https://github.com/Invertex/Invertex-Userscript-Tools/raw/f8b74b4238884620734e5d813070135bd224e7ae/userscript_tools.js
// ==/UserScript==

'use strict';

const is_chrome = navigator?.userAgent?.includes('Chrome') ?? false

addGlobalStyle(`svg.vxDlSVG > path, svg.vxLinkSVG > path  {
    fill: rgba(255, 255, 255, 0.5);
}
.bskyhd-copy-link{
  background: transparent;
  border: none;
}
.bskyhd-copy-link[clicked] > svg.vxLinkSVG > path
{
  animation-iteration-count: infinite;
  animation-duration: 2s;
  animation-name: copylink-animation;
  pointer-events: none !important;
}
.bskyhd-copy-link[clicked], .bskyhd-copy-link[clicked] > svg.vxLinkSVG
{
  pointer-events: none !important;
}
@keyframes copylink-animation
{
    0%
    {
        fill: rgba(255, 50, 40, 0.95);
    }
    100%
    {
        fill: rgba(255, 50, 40, 0.05);
    }
}`);

const linkSVG = `<svg class="vxLinkSVG vxDlSVG" xmlns="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" id="Layer_1" x="0px" y="0px" width="24" height="24" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve" data-google-analytics-opt-out="">
<path fill="white" d="M459.654,233.373l-90.531,90.5c-49.969,50-131.031,50-181,0c-7.875-7.844-14.031-16.688-19.438-25.813  l42.063-42.063c2-2.016,4.469-3.172,6.828-4.531c2.906,9.938,7.984,19.344,15.797,27.156c24.953,24.969,65.563,24.938,90.5,0  l90.5-90.5c24.969-24.969,24.969-65.563,0-90.516c-24.938-24.953-65.531-24.953-90.5,0l-32.188,32.219  c-26.109-10.172-54.25-12.906-81.641-8.891l68.578-68.578c50-49.984,131.031-49.984,181.031,0  C509.623,102.342,509.623,183.389,459.654,233.373z M220.326,382.186l-32.203,32.219c-24.953,24.938-65.563,24.938-90.516,0  c-24.953-24.969-24.953-65.563,0-90.531l90.516-90.5c24.969-24.969,65.547-24.969,90.5,0c7.797,7.797,12.875,17.203,15.813,27.125  c2.375-1.375,4.813-2.5,6.813-4.5l42.063-42.047c-5.375-9.156-11.563-17.969-19.438-25.828c-49.969-49.984-131.031-49.984-181.016,0  l-90.5,90.5c-49.984,50-49.984,131.031,0,181.031c49.984,49.969,131.031,49.969,181.016,0l68.594-68.594  C274.561,395.092,246.42,392.342,220.326,382.186z"/>
</svg>`;

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
    if (is_chrome == false)
    {
        let linksplit = vidElem.poster.split('/');
        for(let i = 1; i < linksplit.length; i++)
        {
            let linkpart = linksplit[i];
            if(linkpart.includes('did%3Aplc'))
            {
                let did = linkpart;
                let cid = linksplit[i + 1];
                vidElem.preload = "auto";
                let hqURL = getVideoUrl(did,cid);
                vidElem.src = hqURL;

                break;
            }
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

async function processPostItem(post)
{
    if(!post || addHasAttribute(post, "bskyEN")) { return; }
    let vid = await awaitElem(post, 'figure > video[poster^="https://video.bsky"],video[src*=".webm"],video[src*=".mp4"]', argsChildAndSub);
    if(vid == null) { return; }

    let buttonBar = await awaitElem(post, 'div:has(> div > div[data-testid="likeBtn"])', argsChildAndSub);

    let copyBtn = document.createElement("button");
    copyBtn.className = "bskyhd-copy-link";
    copyBtn.innerHTML = linkSVG;
    copyBtn.title = "Copy Video Embed Compatible Link";
    copyBtn.onclick = (e)=>
    {
        e.stopPropagation();
        copyPostLink(post, copyBtn);
    };
    buttonBar.appendChild(copyBtn);


    let dlBtn = createDLButton();
    dlBtn.onclick = (e) => {
        e.stopPropagation();
        if(dlBtn.hasAttribute('downloading')) { return; }
        dlBtn.setAttribute('downloading', '');
        downloadPostVid(post, vid, dlBtn);
    };
    buttonBar.appendChild(dlBtn);
}


function findPostLink(post)
{
	let postInfo = post.querySelector('a[href*="/post/"][role="link"]');
    if(postInfo) { return postInfo.href; }

    return window.location.href.includes('/profile/') ? window.location.href : null;
}

function copyPostLink(post, linkBtn)
{
    if(linkBtn.hasAttribute('clicked')) { return; }
    let link = findPostLink(post);
    if(link)
    {
        linkBtn.setAttribute('clicked', '');
        if(link.startsWith('https://bsky.app/'))
        {
            link = link.replace('https://bsky.app/','https://bskye.app/');
        }
        navigator.clipboard.writeText(link);
        window.setTimeout(()=>{
            if(linkBtn.hasAttribute('clicked'))
            {
             linkBtn.removeAttribute('clicked');
            }
        }, 2000);
    }
}

function downloadPostVid(post, vidElem, dlBtn)
{
    let saveData = getSaveDataFromPost(post);
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

function getSaveDataFromPost(post)
{
    let link = "";
    let date = "";
    let username = "";
    let postID = "";

    let postInfo = post.querySelector('a[href*="/post/"][role="link"]');
    if(postInfo)
    {
        link = postInfo.href;
        date = formatFilenameDate(postInfo.getAttribute('data-tooltip'));
    }
    else
    {
        date = post.querySelector('div:has(> button[aria-label*="who can reply" i]) > div')?.innerText;
        date = formatFilenameDate(date);
        link = window.location.href.includes('/profile/') ? window.location.href : null;
    }
    if(link != null)
    {
        let splitLink = link.split('/profile/')[1].split('/post/');
        username = splitLink[0];
        postID = splitLink[1];
        if(!username.endsWith('bsky.social')) { username += '_(BSKY)'; }
    }

    return {username: username, date: date, postID: postID };
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

(async function() {

    let root = await awaitElem(document, 'body #root', argsChildAndSub);
    let vids = root.querySelectorAll('div[data-testid^="feedItem-"] video,div[data-testid^="postThreadItem-"] video');
    vids.forEach(processVidElem);
    watchForAddedNodes(root, false, { attributes: false, childList: true, subtree: true }, onNodesAdded);
})();
