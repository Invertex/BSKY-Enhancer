// ==UserScript==
// @name         BSKY Enhancer
// @namespace    Invertex.BSKY
// @version      0.25
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

var bear = "";
var myDID = null;
//Text content
const style_hideTextContent = `div[data-testid^="feedItem"] div[data-testid^="contentHider"] > div:not(:has(img,video)) { display: none; }`;

//Bottom row bottons
const style_hideBottomRowButtons = `div[data-testid^="feedItem"] div:has(> div[data-testid^="contentHider"]) > div:has([data-testid="likeBtn"]) { display: none; }`;

//Post Link
const style_hidePostLink = `div[data-testid^="feedItem"] div:has(> div[data-testid^="contentHider"]) > div:has(div[dir="auto"] > a[href^="/profile/"]) { display: none; }`;

//Show only image posts
const styleFilter_onlyImagePosts = `div[data-testid^="feedItem"]:not(:has(div[data-testid^="contentHider"] img)) { display: none; }`;

//Show only posts by same user
const styleFilter_onlySameUserPosts = `div[data-testid^="feedItem"]:not(:has(div[dir="auto"] > a[href^="/profile/snailerpark"])) { display: none; }`;

//Post top padding
const style_postTopPadding = `div[data-testid^="feedItem"] > div > [style*="flex-direction: row"] { display: none; }`;

//Left Avatar Panel
const style_LeftAvatarPanel = `div[data-testid^="feedItem"] div:has(> div > div[data-testid^="contentHider"]) > div:has(a[href^="/profile/"] img[src*="avatar"]) { display: none; }`;

//Remove padding
const style_RemovePadding = `div[data-testid^="feedItem"] > div { padding: 0px !important; }
div[data-testid^="feedItem"] div:has(> div[data-testid^="contentHider"]) div[style*="margin-top"] { margin-top: 0px !important; }`;

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
}
div.bskyIVX_followIcon {
    position: fixed;
    width: 1em;
    height: 1em;
    size: 10px;
    align-self: auto;
    margin-left: -0.6em;
    margin-top: 1.8em;
}`);

const linkSVG = `<svg class="vxLinkSVG vxDlSVG" xmlns="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" id="Layer_1" x="0px" y="0px" width="24" height="24" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve" data-google-analytics-opt-out="">
<path fill="white" d="M459.654,233.373l-90.531,90.5c-49.969,50-131.031,50-181,0c-7.875-7.844-14.031-16.688-19.438-25.813  l42.063-42.063c2-2.016,4.469-3.172,6.828-4.531c2.906,9.938,7.984,19.344,15.797,27.156c24.953,24.969,65.563,24.938,90.5,0  l90.5-90.5c24.969-24.969,24.969-65.563,0-90.516c-24.938-24.953-65.531-24.953-90.5,0l-32.188,32.219  c-26.109-10.172-54.25-12.906-81.641-8.891l68.578-68.578c50-49.984,131.031-49.984,181.031,0  C509.623,102.342,509.623,183.389,459.654,233.373z M220.326,382.186l-32.203,32.219c-24.953,24.938-65.563,24.938-90.516,0  c-24.953-24.969-24.953-65.563,0-90.531l90.516-90.5c24.969-24.969,65.547-24.969,90.5,0c7.797,7.797,12.875,17.203,15.813,27.125  c2.375-1.375,4.813-2.5,6.813-4.5l42.063-42.047c-5.375-9.156-11.563-17.969-19.438-25.828c-49.969-49.984-131.031-49.984-181.016,0  l-90.5,90.5c-49.984,50-49.984,131.031,0,181.031c49.984,49.969,131.031,49.969,181.016,0l68.594-68.594  C274.561,395.092,246.42,392.342,220.326,382.186z"/>
</svg>`;

const followSVG = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 24 24">
<path d="M12 3A9 9 0 1 0 12 21A9 9 0 1 0 12 3Z" fill="rgb(100, 180, 255)"></path><path d="M12,22C6.5,22,2,17.5,2,12C2,6.5,6.5,2,12,2c5.5,0,10,4.5,10,10C22,17.5,17.5,22,12,22z M12,4c-4.4,0-8,3.6-8,8 c0,4.4,3.6,8,8,8c4.4,0,8-3.6,8-8C20,7.6,16.4,4,12,4z" fill="#dee82acc" class="bskyEN_follow_outline"></path><path d="M11 7H13V17H11z"></path><path d="M7 11H17V13H7z"></path>
</svg>`;

const is_chrome = navigator?.userAgent?.includes('Chrome') ?? false

/*** CLASSES ***/
class BSKYPost
{
    static cache = new Map();

    video = null;
    images = null;
    followIcon = null;

    get URI() { return this.Data.uri; }
    get CID() { return this.Data.cid; }
    get DID() { return this.Data.author.did; }
    get Handle() { return this.Data.author; }

    get Tags(){
        return this.Data?.record?.tags ?? [];
    }

    get AuthorData() {
        return this.Data.author;
    }

    get VideoSource() {
       return getVideoUrl(this.Data.author.did, this.video.ref.$link);
    }

    get PostDate()
    {
        return formatFilenameDate(this.Data.record.createdAt);
    }

    get VideoIsDownloading() { return this.videoDLButton.hasAttribute('downloading'); }

    static TryCreateNew(postData, newUserCache)
    {
        if(postData?.post?.author == null) { return null; }
        let post = postData.post;

        let postID = post.uri.split('feed.post/').slice(-1)[0];
        let keyName = `${post.author.handle}/${postID}`;
        if(!BSKYPost.cache.has(keyName))
        {
            let newPost = new BSKYPost(post, postID, newUserCache);
            BSKYPost.cache.set(keyName, newPost);
        }
        if(post.replyCount > 0 && Object.hasOwn(post,"replies"))
        {
            for(let i = 0; i < post.replies.length; i++)
            {
                BSKYPost.TryCreateNew(post.replies[i], newUserCache) ;
            }
        }
    }


    /*** EVENTS ***/
    onFollowingChanged = new EventTarget();

    listenForFollowChange(callbackMethod)
    {
        this.onFollowingChanged.addEventListener("followchanged", callbackMethod);
    }

    downloadVideoButtonClicked()
    {
        if(this.VideoIsDownloading) { return; }
        this.setDownloadingState(true)
        let filename = `${this.AuthorData.handle}_${this.PostDate}_${this.postID}.mp4`;
        download(this.VideoSource, filename).then(() => { this.setDownloadingState(false); }).catch(() => { this.setDownloadingState(false); }, 120000);
    }

    updateFollowIcon(followIcon, followStatus)
    {
        if(followIcon != null)
        {
            followIcon.style.display = followStatus.detail.isFollowing === 1 ? "none" : "block";
        }
    }

    /*** UTILITY ***/
    setDownloadingState(downloading)
    {
        if(downloading == true) { this.videoDLButton.setAttribute('downloading', ''); }
        else if(this.videoDLButton.hasAttribute('downloading')) { this.videoDLButton.removeAttribute('downloading'); }
    }

    copyPostLink()
    {
        if(this.copyBtn.hasAttribute('clicked')) { return; }
        if(this.link)
        {
            this.copyBtn.setAttribute('clicked', '');
            let link = this.link;

            if(link.startsWith('https://bsky.app/'))
            {
                link = link.replace('https://bsky.app/','https://bskyx.app/');
            }
            navigator.clipboard.writeText(link);
            window.setTimeout(()=>{
                if(this.copyBtn.hasAttribute('clicked'))
                {
                    this.copyBtn.removeAttribute('clicked');
                }
            }, 2000);
        }
    }

    /*** SETUP ***/
    static async enforceHighQualityVideo(post, postData)
    {
        let vid = await awaitElem(post, 'figure > video[poster^="https://video.bsky"],video[src*=".webm"],video[src*=".mp4"],video', argsChildAndSub);
        if(vid == null) { return; }
        vid.src = postData.VideoSource;
    }

    setupVideoDownloadButton()
    {
        this.videoDLButton = createDLButton();
        this.videoDLButton.onclick = (e) => {
            e.stopPropagation();
            this.downloadVideoButtonClicked();
        };
        this.buttonBar.appendChild(this.videoDLButton);

        if (is_chrome == true) { return; }
        BSKYPost.enforceHighQualityVideo(this.postElem, this);
    }


    async processPostElement(post)
    {
        this.postElem = post;

        var iconElem = this.postElem.querySelector('a[href^="/profile/"]:has(div[data-testid="userAvatarImage"])');
        var followIcon = document.createElement('div');
        followIcon.className = "bskyIVX_followIcon";
        followIcon.innerHTML = followSVG;
        iconElem.appendChild(followIcon);
        this.followIcon = followIcon;
        this.followIcon.style.display = "none";

        if(this.userData.following == 0)
        {
            this.followIcon.style.display = "block";
        }
        this.userData.listenForFollowChange((followUpdate)=>{this.updateFollowIcon(this.followIcon, followUpdate)});

        this.buttonBar = this.postElem.querySelector('div:has(> div > [data-testid="likeBtn"])');

        if(this.hasMedia)
        {
            this.copyBtn = document.createElement("button");
            this.copyBtn.className = "bskyhd-copy-link";
            this.copyBtn.innerHTML = linkSVG;
            this.copyBtn.title = "Copy Video Embed Compatible Link";
            this.copyBtn.onclick = (e)=>
            {
                e.stopPropagation();
                this.copyPostLink();
            };

            this.buttonBar.appendChild(this.copyBtn);

            if(this.video) { this.setupVideoDownloadButton(); }
        }
    }

    constructor(postData, postID, newUserCache)
    {
        this.Data = postData;
        this.postID = postID;
        this.embed = this.Data?.embed;
        this.hasMedia = this.embed != null;
        this.video = null;
        this.images = null;

        if(this.hasMedia)
        {
            if(this.embed.$type.includes('.recordWithMedia'))
            {
                this.quote = this.embed.record;
                this.embed = this.embed.media;
            }
            this.images = this.embed?.images ?? [];
            this.video = this.Data.record?.embed?.video;
        }

        if(!BSKYUser.cache.has(this.DID))
        {
            this.userData = new BSKYUser(this.DID, this.Handle);
            BSKYUser.cache.set(this.DID, this.userData);
            newUserCache.set(this.DID, this.userData);
        }
        else
        {
            this.userData = BSKYUser.cache.get(this.DID);
        }
    }
}


class BSKYUser
{
    static cache = new Map();

    following = -1;
    onFollowingChanged = new EventTarget();
    onFollowChange = new CustomEvent("onFollowChange");
    did = null;
    handle = null;

    constructor(srcDID, srcHandle)
    {
        this.did = srcDID;
        this.handle = srcHandle;
    }

    setFollowing(followState)
    {
        if(followState != this.following)
        {
            this.following = followState;
            this.onFollowingChanged.dispatchEvent(new CustomEvent("followchanged", {detail:{isFollowing: this.following} } ));
        }
    }

    listenForFollowChange(callbackMethod)
    {
        this.onFollowingChanged.addEventListener("followchanged", callbackMethod);
    }

    static async updateNewAddsFollowState(newUserCache)
    {
        const addCnt = newUserCache.size;
        if(addCnt > 0)
        {
            const dids = newUserCache.keys().toArray();
            for(let k = 0; k < addCnt; k+=30)
            {
                const end = k + Math.min(30, addCnt - k);
                const subset = dids.slice(k, end);
                const usersQuery = subset.join('&others=');

                let relationships = await getRelationships(usersQuery);
                if(relationships)
                {
                    relationships.forEach((relationship)=>{
                        newUserCache.get(relationship.did).setFollowing(relationship?.following ? 1 : 0);
                    });
                }
            }
        }
        newUserCache.clear();
    }
}

/*** PROCESSING ***/


async function processFeedItem(feedItem)
{
    let feedPost = await awaitElem(feedItem, 'div[role="link"][data-testid^="feedItem-"],div[role="link"][data-testid^="postThreadItem-"],div[data-testid^="postThreadItem-"]:has(div[role="link"] > a)', argsChildAndSub);
    if(feedPost == null || hasPostProcessed(feedPost)) { return; }
    var url = "";
    if(feedPost.hasAttribute("role") && feedPost.role == "link")
    {
        let link = await awaitElem(feedPost, 'a[role="link"][href^="/profile/"][href*="/post/"]', argsChildAndSub);
        url = link.href;
    }
    else { url = window.location.href; }

    let cacheKey = url.split('profile/').slice(-1)[0].replace('/post/','/');

    let cachedPost = BSKYPost.cache.get(cacheKey);

    if(cachedPost)
    {
        cachedPost.link = url;
        await cachedPost.processPostElement(feedPost);
    }
}

function onFeedItemsAdded(addItems)
{
    if (addItems.length == 0) { return; }
    addItems.forEach(processFeedItem);
}

function setupFeedWatch(feedElem)
{
    if(!hasCustomListener(feedElem))
    {
        onFeedItemsAdded(feedElem.childNodes);
        watchForAddedNodes(feedElem, false, { attributes: false, childList: true }, onFeedItemsAdded);
    }
}

async function setupScreenWatch(screenElem)
{
    if(hasCustomListener(screenElem)){ return; }

    let flatlist = await awaitElem(screenElem, '[data-testid$="eed-flatlist"] > div[style*="removed-body-scroll"] > div', argsChildAndSub);
    let feeds = screenElem.querySelectorAll('[data-testid$="eed-flatlist"] > div[style*="removed-body-scroll"] > div');
    feeds.forEach(setupFeedWatch);
}

async function onNewPageLoaded()
{
    let root = await awaitElem(document, 'body #root main', argsChildAndSub);

    awaitElem(root, 'div[style*="display: flex"] [data-testid="profileScreen"]', argsChildAndSub).then(setupScreenWatch);
    awaitElem(root, '[data-testid="HomeScreen"]', argsChildAndSub).then(setupScreenWatch);
    awaitElem(root, 'div[style*="display: flex"] [data-testid="postThreadScreen"] div[style*="removed-body-scroll"] > div:has(div[data-testid^="postThread"])', argsChildAndSub).then(setupFeedWatch);
}

async function tryProcessFeedData(response)
{
    let json = await response.json();
    if(json == null) { return; }

    let posts = json?.posts ?? json?.feed;

    if(posts != null)
    {
        // We make a new one each time instead of global in case multiple feed processes happen before the response of relationship data for users comes back, otherwise data will change mid-processing
        let newUsersCache = new Map();
        for(let i = 0; i < posts.length; i++)
        {
           BSKYPost.TryCreateNew(posts[i], newUsersCache) ;
        }
        await BSKYUser.updateNewAddsFollowState(newUsersCache);
    }
    else if(json?.thread != null && json.thread?.post)
    {
        let newUsersCache = new Map();
        BSKYPost.TryCreateNew(json.thread, newUsersCache);
        await BSKYUser.updateNewAddsFollowState(newUsersCache);
    }
}

/*** UTILITIES ***/
async function getUserDID(username) {
    let resp = fetch(`https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${username}`);
    if(resp && resp.ok)
    {
        let data = await resp.json();
        return data.did;
    }

    return null;
}

function hasCustomListener(elem) { return addHasAttribute(elem, "bskyENListener"); }

function hasPostProcessed(post) { return addHasAttribute(post, "bskyENPost"); }


async function getFollowStatus(did)
{
    try {
        let resp = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.graph.getRelationships?actor=${myDID}&others=${did}`);

        if(!resp.ok) { return false; }

        const data = await resp.json();
        if(data?.vierelationships?.[0]?.following != null) { return true; }

    } catch(e) { return false; }

    return false;
}

async function getRelationships(others)
{
    try {
        let resp = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.graph.getRelationships?actor=${myDID}&others=${others}`);

        if(!resp.ok) { return null; }

        const data = await resp.json();
        return data?.relationships;

    } catch(e) { return null; }

    return null;
}

function formatFilenameDate(date)
{
    date = date.replace(' at',',');
    let isoDate = new Date(date);
    return isoDate.toISOString("YYYY-MM-DD").split('T')[0];
}

// Thanks to `https://github.com/FerroEduardo/bskyx` for this nifty little API call info
function getVideoUrl(authorDid, videoCid) {
  const randomNumber = Math.floor(Math.random() * 100); // Prevent Discord ban/rate limit video
  return `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${authorDid}&cid=${videoCid}&r=${randomNumber}`;
}

/*
function getFollows(username, did)
{
    fetch(`https://bsky.social/xrpc/app.bsky.graph.getFollows?actor=${did}&limit=100`,
         {
        "headers": {
            "accept": '*//*',
            "accept-encoding":"gzip, deflate, br, zstd",
            "accept-language": "en-US,en;q=0.9",
            "authorization": bear,
        },
        "body": null,
        "origin":"https://bsky.app",
        "referer":"https://bsky.app/",
        "method": "GET",
        "mode": "cors"
    });
}*/


/*** OVERRIDES ***/
const { fetch: originalFetch } = unsafeWindow;

async function checkCreateRecordForFollow(record)
{
    if(record && record?.record && record.record.$type?.includes('graph.follow'))
    {
        let did = record.record.subject;
        let cachedUser = BSKYUser.cache.get(did);
        if(cachedUser) { cachedUser.setFollowing(1); }
    }
}

unsafeWindow.fetch = exportFunction(async (...args) => {
    const [resource, config] = args;

    let isGetSession = (resource?.constructor === URL && resource.href.includes('server.getSession'));
    let isRequest = resource?.constructor === Request;

    if(!isGetSession && isRequest && resource.url.includes('repo.createRecord'))
    {
        resource.clone().json().then(checkCreateRecordForFollow);
    }
    if(isGetSession)
    {
        if(config?.headers?.has("authorization"))
        {
            bear = config?.headers?.get("authorization");
        }
    }

    const response = await originalFetch(resource, config);
    if(isGetSession)
    {
        var sessionData = await response.clone().json();
        myDID = sessionData?.did;
    }
    else if(isRequest && resource.url.includes('bsky.feed.'))
    {
        tryProcessFeedData(response.clone());
    }

    return response;
}, unsafeWindow);

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

/*** EVENTS ***/
unsafeWindow.addEventListener('locationchange', function () {
    onNewPageLoaded();
});

(() => {
    let oldPushState = history.pushState;
    history.pushState = function pushState() {
        let ret = oldPushState.apply(this, arguments);
        unsafeWindow.dispatchEvent(new Event('pushstate'));
        unsafeWindow.dispatchEvent(new Event('locationchange'));
        return ret;
    };

    let oldReplaceState = history.replaceState;
    history.replaceState = function replaceState() {
        let ret = oldReplaceState.apply(this, arguments);
        unsafeWindow.dispatchEvent(new Event('replacestate'));
        unsafeWindow.dispatchEvent(new Event('locationchange'));
        return ret;
    };

    unsafeWindow.addEventListener('popstate', () => {
        unsafeWindow.dispatchEvent(new Event('locationchange'));
    });
})();

/*** ENTRY ***/
(async function()
 {
    console.log("start userscript");
    let root = await awaitElem(document, 'body #root', argsChildAndSub);
    onNewPageLoaded();
})();