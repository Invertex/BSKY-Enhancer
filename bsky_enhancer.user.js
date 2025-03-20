// ==UserScript==
// @name         BSKY Enhancer
// @namespace    Invertex.BSKY
// @version      0.32
// @description  Quality of life improvements for BSKY
// @author       Invertex
// @updateURL    https://github.com/Invertex/BSKY-Enhancer/raw/main/bsky_enhancer.user.js
// @downloadURL  https://github.com/Invertex/BSKY-Enhancer/raw/main/bsky_enhancer.user.js
// @match        https://bsky.app/*
// @connect      self
// @connect      bsky.social
// @connect      bsky.network
// @connect      tenor.com
// @connect      media.tenor.com
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bsky.app
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM.download
// @grant        GM_setClipboard
// @grant        unsafeWindow
// @run-at       document-start
// @require      https://github.com/Invertex/Invertex-Userscript-Tools/raw/f8b74b4238884620734e5d813070135bd224e7ae/userscript_tools.js
// ==/UserScript==


const { fetch: originalFetch } = window;


var myDID = null;
const GM_OpenInTabMissing = (typeof GM_openInTab === 'undefined');
const is_chrome = navigator?.userAgent?.includes('Chrome') ?? false

function downloadFile(url, filename, timeout = -1) {
    return new Promise((resolve, reject) => {
        const dl = GM.download({
            name: filename,
            url: url,
            onload: resolve,
            onerror: reject,
            ontimeout: reject,
            saveAs: true
        });
        if (timeout >= 0) {
            window.setTimeout(() => {
                dl?.abort();
                reject(null);
            }, timeout);
        }
    });
}

addGlobalStyle(`svg.vxDlSVG > path, svg.vxLinkSVG > path  {
    fill: rgba(255, 255, 255, 0.5);
}
.bskyhd-copy-link{
  background: transparent;
  border: none;
}
.bskyhd-copy-link[clicked] > svg.vxLinkSVG > path{
  animation-iteration-count: infinite;
  animation-duration: 2s;
  animation-name: copylink-animation;
  pointer-events: none !important;
}
.bskyhd-copy-link[clicked], .bskyhd-copy-link[clicked] > svg.vxLinkSVG{
  pointer-events: none !important;
}
@keyframes copylink-animation{
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
    margin-left: 1.6em;
    margin-top: 1.7em;
}`);

addGlobalStyle(`@-webkit-keyframes spin { 0% { -webkit-transform: rotate(0deg); transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); transform: rotate(360deg); } }
div#thd_button_Download[downloading] {
  pointer-events: none !important;
}
div#thd_button_Download[downloading] svg {
  pointer-events: none !important;
  background-color: rgba(143, 44, 242, 0.5);
  border-radius: 12px;
  animation-iteration-count: infinite;
  animation-duration: 2s;
  animation-name: dl-animation;
}
div#thd_button_Download[downloading] svg > path {
    fill: rgba(255,255,255,0.2);
}
div[thd_customctx]:has(video[downloading]) {
  border-style: solid;
  border-color: cyan;
  border-width: 3px;
  border-radius: 0px 12px 12px 0px;
  animation-iteration-count: infinite;
  animation-duration: 2s;
  animation-name: dl-animation;
}
@keyframes spin { 0% { -webkit-transform: rotate(0deg); transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); transform: rotate(360deg); } }
.loader { border: 16px solid #f3f3f373; display: -webkit-box; display: -ms-flexbox; display: flex; margin: auto; border-top: 16px solid #3498db99; border-radius: 50%; width: 120px; height: 120px; -webkit-animation: spin 2s linear infinite; animation: spin 2s linear infinite;}
.context-menu { position: absolute; text-align: center; margin: 0px; background: #040404; border: 1px solid #0e0e0e; border-radius: 5px;}
.context-menu ul { padding: 0px; margin: 0px; min-width: 190px; list-style: none;}
.context-menu ul li { padding-bottom: 7px; padding-top: 7px; border: 1px solid #0e0e0e; color:#c1bcbc; font-family: sans-serif; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;}
.context-menu ul li:hover { background: #202020;}

:root {
--bskyEN-tab-on-var: rgb(32, 139, 254) !important;
--bskyEN-tabtext-on-var: rgb(241, 243, 245) !important;
--bskyEN-tabtext-off-var: rgb(147, 165, 183) !important;
}

.bskyEN-tab-off {
background-color: rgb(0,0,0,0) !important;
}
.bskyEN-tab-on {
background-color: var(--bskyEN-tab-on-var) !important;
}
.bskyEN-tabtext-on {
color: var(--bskyEN-tabtext-on-var) !important;
}
.bskyEN-tabtext-off {
color: var(--bskyEN-tabtext-off-var) !important;
}
`);

const linkSVG = `<svg class="vxLinkSVG vxDlSVG" xmlns="http://www.w3.org/2000/svg" version="1.1" id="Layer_1" x="0px" y="0px" width="24" height="24" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve">
<path fill="white" d="M459.654,233.373l-90.531,90.5c-49.969,50-131.031,50-181,0c-7.875-7.844-14.031-16.688-19.438-25.813  l42.063-42.063c2-2.016,4.469-3.172,6.828-4.531c2.906,9.938,7.984,19.344,15.797,
27.156c24.953,24.969,65.563,24.938,90.5,0  l90.5-90.5c24.969-24.969,24.969-65.563,0-90.516c-24.938-24.953-65.531-24.953-90.5,0l-32.188,32.219  c-26.109-10.172-54.25-12.906-81.641-8.891l68.578-68.578c50-49.984,131.031-49.984,181.031,
0  C509.623,102.342,509.623,183.389,459.654,233.373z M220.326,382.186l-32.203,32.219c-24.953,24.938-65.563,24.938-90.516,0  c-24.953-24.969-24.953-65.563,0-90.531l90.516-90.5c24.969-24.969,65.547-24.969,90.5,0c7.797,7.797,12.875,17.203,15.813,
27.125  c2.375-1.375,4.813-2.5,6.813-4.5l42.063-42.047c-5.375-9.156-11.563-17.969-19.438-25.828c-49.969-49.984-131.031-49.984-181.016,0  l-90.5,90.5c-49.984,50-49.984,131.031,0,181.031c49.984,49.969,131.031,49.969,181.016,0l68.594-68.594  C274.561,395.092,246.42,392.342,220.326,382.186z"/>
</svg>`;

const followSVG = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
<path d="M12 3A9 9 0 1 0 12 21A9 9 0 1 0 12 3Z" fill="rgb(52 70 91)"></path>
<path d="M12,22C6.5,22,2,17.5,2,12C2,6.5,6.5,2,12,2c5.5,0,10,4.5,10,10C22,17.5,17.5,22,12,22z M12,4c-4.4,0-8,3.6-8,8 c0,4.4,3.6,8,8,8c4.4,0,8-3.6,8-8C20,7.6,16.4,4,12,4z" fill="rgb(19 19 20)"></path>
<path d="M11 8H13V16H11z" fill="rgb(117 139 162)"></path><path d="M8 11H16V13H8z" fill="rgb(117 139 162)"></path>
</svg>`;

/*** CLASSES ***/
class BSKYPost{
    static cache = new Map();

    record = null;
    embed = null;
    embedRecord = null;
    video = null;
    images = null;
    hasMedia = false;
    followIcon = null;
    recordWithMedia = false;

    get URI() {
        return this.Data.uri;
    }
    get CID() {
        return this.Data.cid;
    }
    get DID() {
        return this.Data.author.did;
    }
    get Handle() {
        return this.Data.author.handle;
    }

    get Tags() {
        return this?.record?.tags ?? [];
    }

    get AuthorData() {
        return this.Data.author;
    }

    get VideoSource() {
        return getSourceURL(this.Data.author.did, this.video.ref.$link);
    }

    get PostDate() {
        return formatFilenameDate(this.record.createdAt);
    }

    get FilenameBase() {
        return `${this.DID.replace('did:plc:','didplc-')}_(${this.Handle})_${this.PostDate}_${this.postID}`;
    }

    /*** EVENTS ***/
    onFollowingChanged = new EventTarget();

    listenForFollowChange(callbackMethod) {
        this.onFollowingChanged.addEventListener("followchanged", callbackMethod);
    }

    async downloadVideoButtonClicked() {
        if (this.isVideoDownloading) {
            return;
        }
        this.setDownloadingState(true);
        const ext = BSKYPost.extensionFromMimeType(this.record.embed.video.mimeType);
        let filename = `${this.FilenameBase}${ext}`;
        await downloadFile(this.VideoSource, filename, 120000);
        this.setDownloadingState(false);
    }

    downloadImageClicked(imgThumbURL) {
        let imgData = this.getImageDataFromURL(imgThumbURL);

        if (imgData) {
            var filename = "";
            if (this.embedRecord?.images?.length > 1) {
                filename = `${this.FilenameBase}_${imgData.index}${imgData.extension}`;
            } else {
                filename = `${this.FilenameBase}${imgData.extension}`;
            }
            downloadFile(imgData.urlSRC, filename);
        }
    }

    updateFollowIcon(followIcon, followStatus) {
        if (followIcon != null) {
            followIcon.style.display = followStatus.detail.isFollowing === 1 ? "none" : "block";
        }
    }

    /*** UTILITY ***/
    tryGetPostDataForFullScreen(imgThumb) {
        if (this.images == null || this.images.length == 0 || this.embedExternal != null) {
            return null;
        }
        let imgDat = this.getImageDataFromURL(imgThumb);
        if (imgDat) {
            return {
                post: this,
                imgData: imgDat
            };
        }
        return null;
    }

    get isVideoDownloading() {
        return this.videoDLButton.hasAttribute('downloading');
    }

    setDownloadingState(downloading) {
        if (downloading == true) {
            this.videoDLButton.setAttribute('downloading', '');
        } else if (this.videoDLButton.hasAttribute('downloading')) {
            this.videoDLButton.removeAttribute('downloading');
        }
    }

    copyPostLink() {
        if (this.copyBtn.hasAttribute('clicked')) {
            return;
        }
        if (this.link) {
            this.copyBtn.setAttribute('clicked', '');
            let link = this.link;

            if (link.startsWith('https://bsky.app/')) {
                link = link.replace('https://bsky.app/', 'https://bskyx.app/');
            }
            navigator.clipboard.writeText(link);
            window.setTimeout(() => {
                if (this.copyBtn.hasAttribute('clicked')) {
                    this.copyBtn.removeAttribute('clicked');
                }
            }, 2000);
        }
    }

    static extensionFromMimeType(mimeType) {
        let importantPart = mimeType.split('/').at(-1);
        switch (importantPart) {
        case "jpeg":
            return ".jpg";
        case "png":
            return ".png";
        case "webp":
            return ".webp";
        case "webm":
            return ".webm";
        case "gif":
            return ".gif";
        default:
            return '.' + importantPart;
        }

        return '.' + importantPart;
    }

    getImageDataFromURL(imgThumbURL) {
        if (this.embedExternal != null) {
            let url = this.embedExternal.uri;
            let extensionName = '.' + url.split('?')[0].split('.').at(-1);
            return {
                url: url,
                urlSRC: url,
                index: -1,
                extension: extensionName
            };
        } else if (this.embedRecord.images == null) {
            return null;
        }

        for (let i = 0; i < this.embedRecord.images.length; i++) {
            let imgRecord = this.embedRecord.images[i];
            if (Object.hasOwn(imgRecord, 'image')) {
                imgRecord = imgRecord.image;
            }
            if (imgThumbURL.includes(imgRecord.ref.$link)) {
                let extensionName = BSKYPost.extensionFromMimeType(imgRecord.mimeType);
                let srcURL = getSourceURL(this.AuthorData.did, imgRecord.ref.$link);

                return {
                    url: imgRecord.fullsize,
                    urlSRC: srcURL,
                    index: i + 1,
                    extension: extensionName
                };
            }
        }

        return null;
    }

    /*** SETUP ***/

    async setupVideoElem() {
        if (this.postElem.querySelector('button[title="Download"]')) {
            return;
        }
        this.videoDLButton = createDLButton();
        this.videoDLButton.onclick = (e) => {
            e.stopPropagation();
            this.downloadVideoButtonClicked();
        };

        this.buttonBar.appendChild(this.videoDLButton);

        let vidElem = await awaitElem(this.postElem, 'video', argsChildAndSub);

        if (vidElem == null) {
            return;
        }
        let selTarget = vidElem.parentElement.parentElement.parentElement.parentElement.parentElement;

        let selContext = new SelectionCtx(this, selTarget, false, true, vidElem);
        addCustomCtxMenu(selContext);

        if (is_chrome == true) {
            return;
        }
        vidElem.preload = 'auto';
        vidElem.src = this.VideoSource;
    }

    setupFullscreenImageContext(fullscreenElem) {
        let selContext = new SelectionCtx(this, fullscreenElem, true, false);
        addCustomCtxMenu(selContext);
    }

    async setupImageElems() {
        let imageElemLoaded = await awaitElem(this.postElem, 'img[src*="/img/feed_"]', argsChildAndSub);
        if (addHasModified(imageElemLoaded)) {
            return;
        }

        if (this?.embedRecord == null || this?.embedRecord?.images == null) {
            return;
        }

        let images = this.embedRecord.images;
        let imgcnt = images.length;
        for (let i = 0; i < imgcnt; i++) {
            let imgData = this.embedRecord.images[i];

            let imgElem = await awaitElem(this.postElem, `img[src*="${imgData.image.ref.$link}"]`, argsChildAndSub);
            let selContext = new SelectionCtx(this, imgElem, true, false);
            addCustomCtxMenu(selContext);
        }
    }

    async setupExternalEmbed() {
        let vidElem = await awaitElem(this.postElem, 'video', argsChildAndSub);
        if (vidElem == null || addHasModified(vidElem)) {
            return;
        }
        let selTarget = vidElem.parentElement.parentElement;

        this.images = [this.embedExternal.uri];
        let selContext = new SelectionCtx(this, selTarget, true, false);
        addCustomCtxMenu(selContext);
    }

    async processPostElement(post) {
        this.postElem = post;

        var iconElem = await awaitElem(this.postElem, 'a[href^="/profile/"]:has(div[data-testid="userAvatarImage"])', argsChildAndSub);
        var followIcon = document.createElement('div');
        followIcon.className = "bskyIVX_followIcon";
        followIcon.innerHTML = followSVG;
        iconElem.appendChild(followIcon);
        this.followIcon = followIcon;
        this.followIcon.style.display = "none";

        if (this.userData.following == 0) {
            this.followIcon.style.display = "block";
        }
        this.userData.listenForFollowChange((followUpdate) => {
            this.updateFollowIcon(this.followIcon, followUpdate)
        });

        this.buttonBar = this.postElem.querySelector('div:has(> div > [data-testid="likeBtn"])');

        if (this.embed != null) {
            if (!this.buttonBar.querySelector('button.bskyhd-copy-link')) {
                this.copyBtn = document.createElement("button");
                this.copyBtn.className = "bskyhd-copy-link";
                this.copyBtn.innerHTML = linkSVG;
                this.copyBtn.title = "Copy Video Embed Compatible Link";
                this.copyBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.copyPostLink();
                };

                this.buttonBar.appendChild(this.copyBtn);

            }

            if (this.video) {
                await this.setupVideoElem();
            } else if (this.images != null && this.images.length > 0) {
                await this.setupImageElems();
            } else if (this.embedExternal != null) {
                await this.setupExternalEmbed();
            }
        }
    }

    static TryCreateNew(postData, newUserCache) {
        let post = Object.hasOwn(postData, 'post') ? postData.post : postData;
        if (!Object.hasOwn(post, 'author')) {
            console.warn("post null, something went wrong");
            return null;
        }

        let postID = post.uri.split('feed.post/').at(-1);
        let keyName = `${post.author.handle}/${postID}`;

        if (!BSKYPost.cache.has(keyName)) {
            let newPost = new BSKYPost(post, postID, newUserCache);
            BSKYPost.cache.set(keyName, newPost);
        }
        if (Object.hasOwn(postData, 'reply')) {
            if (Object.hasOwn(postData.reply, 'root')) {
                BSKYPost.TryCreateNew({
                    post: postData.reply.root
                }, newUserCache);
            }
            if (Object.hasOwn(postData.reply, 'parent')) {
                BSKYPost.TryCreateNew({
                    post: postData.reply.parent
                }, newUserCache);
            }
        }
        if (Object.hasOwn(postData, 'parent')) {
            BSKYPost.TryCreateNew({
                post: postData.parent.post
            }, newUserCache);
        }
        if (post.replyCount > 0 && Object.hasOwn(postData, "replies")) {
            for (let i = 0; i < postData.replies.length; i++) {
                BSKYPost.TryCreateNew(postData.replies[i], newUserCache);
            }
        }
    }

    constructor(postData, postID, newUserCache) {
        this.Data = postData;
        this.postID = postID;
        this.embed = this.Data?.embed ?? this.Data?.embeds?.[0];
        this.record = this.Data?.record ?? this.Data?.value;

        this.hasMedia = this.embed != null;
        let hasImage = this.hasMedia && this.embed.$type.includes('embed.images#');
        let hasVideo = this.hasMedia && this.embed.$type.includes('embed.video#');
        this.video = null;
        this.images = null;

        if (this.hasMedia) {
            if (this.embed.$type.includes('.recordWithMedia')) {
                this.recordWithMedia = true;
                this.quote = BSKYPost.TryCreateNew({
                    post: this.embed.record.record
                }, newUserCache);
                this.embed = this.embed.media;
                this.embedRecord = this.record.embed.media;
                hasImage = Object.hasOwn(this.embed, 'images');
                hasVideo = Object.hasOwn(this.embedRecord, 'video');
            } else {
                this.embedRecord = this.record.embed;
            }
            if (hasImage) {
                this.images = this.embed?.images;
            } else if (hasVideo) {
                this.video = this.record?.embed?.video;
            } else if (Object.hasOwn(this.embed, 'external')) {
                this.embedExternal = this.embed.external;
            }
        }
        if (!BSKYUser.cache.has(this.DID)) {
            this.userData = new BSKYUser(this.DID, this.Handle);
            BSKYUser.cache.set(this.DID, this.userData);
            newUserCache.set(this.DID, this.userData);
            this.userData.posts.set(this.postID, this);
        } else {
            this.userData = BSKYUser.cache.get(this.DID);
            if (!this.userData.posts.has(this.postID)) {
                this.userData.posts.set(this.postID, this);
            }
        }
    }
}

class BSKYUser{
    static cache = new Map();
    static handleCache = new Map();

    following_state = -1;
    onFollowingChanged = new EventTarget();
    onFollowChange = new CustomEvent("onFollowChange");
    did = null;
    handle = null;
    posts = new Map();

    get following() {
        if (this.did == myDID) {
            this.following_state = 0;
            return 1;
        }
        return this.following_state;
    }

    constructor(srcDID, srcHandle) {
        this.did = srcDID;
        this.handle = srcHandle;
        if (!BSKYUser.handleCache.has(srcDID)) {
            BSKYUser.handleCache.set(srcDID, srcHandle);
        }
    }

    setFollowing(followState) {
        if (followState != this.following_state) {
            this.following_state = followState;
            this.onFollowingChanged.dispatchEvent(new CustomEvent("followchanged", {
                    detail: {
                        isFollowing: this.following
                    }
                }));
        }
    }

    listenForFollowChange(callbackMethod) {
        this.onFollowingChanged.addEventListener("followchanged", callbackMethod);
    }

    static findPostFromImage(imgURL) {
        let parts = imgURL.split('/img/').at(-1).split('/');
        let DID = parts.at(-2);
        let imgKey = parts.at(-1);
        let user = BSKYUser.cache.get(DID);

        if (user) {
            for (const post of user.posts.values()) {
                let postData = post.tryGetPostDataForFullScreen(imgKey);
                if (postData) {
                    return postData;
                }
            }
        }
        return null;
    }

    static getHandleFromDID(did) {
        return BSKYUser.handleCache.get(did);
    }

    static async updateNewAddsFollowState(newUserCache) {
        const addCnt = newUserCache.size;
        if (addCnt > 0 && newUserCache) {
            const keyz = newUserCache.keys();
            const dids = Array.from(keyz);
            for (let k = 0; k < addCnt; k += 30) {
                const end = k + Math.min(30, addCnt - k);
                const subset = dids.slice(k, end);
                const usersQuery = subset.join('&others=');

                let relationships = await getRelationships(usersQuery);
                if (relationships) {
                    relationships.forEach((relationship) => {
                        newUserCache.get(relationship.did).setFollowing(relationship?.following ? 1 : 0);
                    });
                }
            }
        }
        newUserCache.clear();
    }
}

/*** PROCESSING ***/
async function processFeedItem(feedItem) {
    let feedPost = await awaitElem(feedItem, 'div[role="link"][data-testid^="feedItem-"],div[role="link"][data-testid^="postThreadItem-"],div[data-testid^="postThreadItem-"]:has(div[role="link"]),div[role="link"]', argsChildAndSub);
    if (feedPost == null || hasPostProcessed(feedPost)) {
        return;
    }
    var url = "";

    if (feedPost.hasAttribute("role") && feedPost.role == "link") {
        let link = await awaitElem(feedPost, 'a[role="link"][href*="/profile/"][href*="/post/"]', argsChildAndSub);
        url = link.href;
    } else {
        url = unsafeWindow.location.href;
    }

    let urlParts = url.split('profile/').at(-1).split('/post/');
    let handle = urlParts[0];
    let postID = urlParts[1];
    if (handle.startsWith('did:')) {
        handle = BSKYUser.getHandleFromDID(handle);
    }
    let cacheKey = handle + '/' + postID;
    let cachedPost = BSKYPost.cache.get(cacheKey);

    if (cachedPost) {
        cachedPost.link = url;
        await cachedPost.processPostElement(feedPost);
    }
}

function onFeedItemsAdded(addItems) {
    if (addItems.length == 0) {
        return;
    }
    addItems.forEach(processFeedItem);
}

function setupFeedWatch(feedElem) {
    if (!hasCustomListener(feedElem)) {
        onFeedItemsAdded(feedElem.childNodes);
        watchForAddedNodes(feedElem, false, {
            attributes: false,
            childList: true
        }, onFeedItemsAdded);
    }
}

async function setupScreenWatch(screenElem) {
    if (hasCustomListener(screenElem)) {
        return;
    }

    let flatlist = await awaitElem(screenElem, '[data-testid$="eed-flatlist"] > div[style*="removed-body-scroll"] > div', argsChildAndSub);
    let feeds = screenElem.querySelectorAll('[data-testid$="eed-flatlist"] > div[style*="removed-body-scroll"] > div');
    feeds.forEach(setupFeedWatch);
}

async function checkPanel(panel) {
    if (panel.firstElementChild.tagName == 'BUTTON') {
        let img = await awaitElem(panel.firstElementChild, 'IMG[src*="/img/"]', argsChildAndSub);
        if (img) {
            let postData = BSKYUser.findPostFromImage(img.src);
            if (postData != null) {
                postData.post.setupFullscreenImageContext(img);
            }
        }
    }
}

function onPanelsAdded(addItems) {
    if (addItems.length == 0) {
        return;
    }
    addItems.forEach(checkPanel);
}


function processProfileTabs(profileScreen) {
    let tabList = profileScreen.querySelector('div[role="tablist"][data-testid="profilePager"] div[data-testid="profilePager-selector"]');

    if (tabList == null || addHasModified(tabList)) {
        return;
    }
    let personalLikesTab = tabList.querySelector('div[data-testid="profilePager-Likes"]');
    if (personalLikesTab) {
        return;
    }
    let repliesTab = tabList.querySelector('div[data-testid="profilePager-selector-1"]');
    let postsTab = tabList.querySelector('div[data-testid="profilePager-selector-0"]');

    if (repliesTab) {
        let tabs = tabList.querySelectorAll('div[role="tablist"] div[data-testid^="profilePager-sel"]');
        for (let t = 0; t < tabs.length; t++) {
            let tab = tabs[t];
            let tabBottom = tab.firstElementChild.querySelector('div[data-testid^="profilePager"] > div');

            if (tabBottom && tabBottom?.style) {
                let bottomTabColor = tabBottom.style.backgroundColor;
                let selTextColor = tabBottom.parentElement.style.color;

                document.documentElement.style.setProperty("--bskyEN-tab-on-var", bottomTabColor);
                document.documentElement.style.setProperty("--bskyEN-tabtext-on-var", selTextColor);

                break;
            }

        }

        let likesTab = repliesTab.cloneNode(true);
        likesTab.setAttribute('data-testid', 'profilePager-selector-25');
        let likesBottom = likesTab.firstElementChild.querySelector('div[data-testid^="profilePager"] > div');
        let likesBottomHolder = likesBottom.parentElement;

        document.documentElement.style.setProperty("--bskyEN-tabtext-off-var", likesBottomHolder.style.color);

        likesTab.appendChild(likesBottom);
        likesBottomHolder.innerText = "Likes";
        likesBottomHolder.appendChild(likesBottom);
        likesBottomHolder.setAttribute('data-testid', 'profilePager-Likes');
        let repliesBottom = repliesTab.firstElementChild.querySelector('div[data-testid^="profilePager-Replies"] > div');
        let repliesBottomHolder = repliesBottom.parentElement;

        repliesTab.after(likesTab);

        likesTab.addEventListener('click', function (e) {
            w.stateProps.useLikesList = true;
            repliesTab.click();
            w.stateProps.useLikesList = true;
            addClassName(likesBottomHolder, "bskyEN-tabtext-on");
            addClassName(likesBottom, "bskyEN-tab-on");
            addClassName(repliesBottom, "bskyEN-tab-off");
            addClassName(repliesBottomHolder, "bskyEN-tabtext-off");
        });
        //Cleanup our custom styling
        tabs.forEach((tab) => {
            tab.addEventListener('click', function (e) {
                removeClassName(likesBottom, "bskyEN-tab-on");
                removeClassName(likesBottomHolder, "bskyEN-tabtext-on");
                removeClassName(repliesBottomHolder, "bskyEN-tabtext-off");
                removeClassName(repliesBottom, "bskyEN-tab-off");
            });
        });

        repliesTab.addEventListener('click', (e) => {
            w.stateProps.useLikesList = false;
        });
    }
}

async function onNewPageLoaded() {
    w.stateProps.useLikesList = false;
    let root = await awaitElem(document, 'body #root main', argsChildAndSub);
    let panelsRoot = root.parentElement;
    if (!addHasModified(panelsRoot)) {
        onPanelsAdded(panelsRoot.childNodes);
        watchForAddedNodes(panelsRoot, false, {
            attributes: false,
            childList: true
        }, onPanelsAdded);
    }

    awaitElem(root, 'div[style*="display: flex"] [data-testid="profileScreen"]', argsChildAndSub).then(async(profileScreen) => {
        await setupScreenWatch(profileScreen);
        processProfileTabs(profileScreen);
    });
    awaitElem(root, '[data-testid="HomeScreen"]', argsChildAndSub).then(setupScreenWatch);
    awaitElem(root, 'div[style*="display: flex"] [data-testid="profileListScreen"]', argsChildAndSub).then(setupScreenWatch);
    awaitElem(root, 'div[style*="display: flex"] [data-testid="postThreadScreen"] div[style*="removed-body-scroll"] > div:has(div[data-testid^="postThread"])', argsChildAndSub).then(setupFeedWatch);
    awaitElem(root, 'div[style*="display: flex"] [data-testid="profileFeedScreen"] div[style*="removed-body-scroll"] > div:has(div[data-testid^="feedItem-"])', argsChildAndSub).then(setupFeedWatch);
    awaitElem(root, 'div[style*="display: flex"]:has(div[style*="removed-body-scroll"] div[role="tablist"]) div[style*="removed-body-scroll"]:has(a[href^="/profile/"]) > div', argsChildAndSub).then(setupFeedWatch);
}

async function tryProcessFeedData(response) {
    // let json = await response.json();
    let json = response;
    if (json == null) {
        return;
    }

    let posts = json?.posts ?? json?.feed;

    if (posts != null) {
        // We make a new one each time instead of global in case multiple feed processes happen before the response of relationship data for users comes back, otherwise data will change mid-processing
        let newUsersCache = new Map();

        for (let i = 0; i < posts.length; i++) {
            BSKYPost.TryCreateNew(posts[i], newUsersCache);
        }
        await BSKYUser.updateNewAddsFollowState(newUsersCache);
    } else if (json?.thread != null && json.thread?.post) {
        let newUsersCache = new Map();

        BSKYPost.TryCreateNew(json.thread, newUsersCache);
        await BSKYUser.updateNewAddsFollowState(newUsersCache);
    }
}

function getTagFacet(hashtag, start, end) {
    return {
        "$type": "app.bsky.richtext.facet",
        "features": [{
                "$type": "app.bsky.richtext.facet#tag",
                "tag": hashtag
            }
        ],
        "index": {
            "byteEnd": end,
            "byteStart": start
        }
    };
}

function modifyTagsText(json) {
    let posts = json?.posts ?? json?.feed;
    if (posts && posts.length > 0) {
        let usesPostKey = Object.hasOwn(posts[0], 'post');
        for (let i = 0; i < posts.length; i++) {
            let rec = usesPostKey ? posts[i].post.record : posts[i].record;
            let textLen = byteLengthCharCode(rec.text);
            let txt = rec.text;

            if (rec?.tags && rec.tags.length > 0) {
                textLen += 1;
                txt += '\n';
                for (let x = 0; x < rec.tags.length; x++) {
                    let tag = rec.tags[x];
                    let start = textLen;
                    textLen += tag.length + 1;
                    let end = textLen;
                    textLen += 1;
                    let facet = getTagFacet(tag, start, end);
                    rec.facets.push(facet);
                    txt += '#' + tag + ' ';
                }
                rec.text = txt;
            }
        }
    }
}

/*** UTILITIES ***/
async function getUserDID(username) {
    let resp = fetch(`https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${username}`);
    if (resp && resp.ok) {
        let data = await resp.json();
        return data.did;
    }

    return null;
}

function hasCustomListener(elem) {
    return addHasAttribute(elem, "bskyENListener");
}

function hasPostProcessed(post) {
    return addHasAttribute(post, "bskyENPost");
}

function addHasModified(elem) {
    return addHasAttribute(elem, "bskyEN-modified");
}

async function getFollowStatus(did) {
    try {
        let resp = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.graph.getRelationships?actor=${myDID}&others=${did}`);

        if (!resp.ok) {
            return false;
        }

        const data = await resp.json();
        if (data?.vierelationships?.[0]?.following != null) {
            return true;
        }

    } catch (e) {
        return false;
    }

    return false;
}

async function getRelationships(others) {
    try {
        let resp = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.graph.getRelationships?actor=${myDID}&others=${others}`);

        if (!resp.ok) {
            return null;
        }

        const data = await resp.json();
        return data?.relationships;

    } catch (e) {
        return null;
    }

    return null;
}

function getHashtagElem(hashtag, radix) {
    return `<a href="/hashtag/${hashtag}" aria-expanded="false" aria-haspopup="menu" aria-label="Hashtag ${hashtag}" role="link" data-no-underline="1" class="css-1jxf684 r-1loqt21" id="radix-:r${radix}:" style="font-size: 15px;
    letter-spacing: 0px; color: rgb(32, 139, 254); line-height: 20px; flex: 1 1 0%; font-family: InterVariable, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI";, Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"; font-variant: no-contextual;">
    <span class="css-1jxf684">#${hashtag}</span></a>`;
}

// Thanks to `https://github.com/FerroEduardo/bskyx` for this nifty little API call info
function getSourceURL(authorDid, videoCid) {
    const randomNumber = Math.floor(Math.random() * 100); // Prevent Discord ban/rate limit video
    return `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${authorDid}&cid=${videoCid}&r=${randomNumber}`;
}

function formatFilenameDate(date) {
    date = date.replace(' at', ',');
    let isoDate = new Date(date);
    return isoDate.toISOString("YYYY-MM-DD").split('T')[0];
}

// returns the byte length of an utf8 string
function byteLengthCharCode(str) {
    var s = str.length;
    for (var i = str.length - 1; i >= 0; i--) {
        var code = str.charCodeAt(i);
        if (code > 0x7f && code <= 0x7ff)
            s++;
        else if (code > 0x7ff && code <= 0xffff)
            s += 2;
        if (code >= 0xDC00 && code <= 0xDFFF)
            i--; //trail surrogate
        else if (i > 0 && str[i] == 'n' && str[i - 1] == '\\')
            s -= 1; // New-line is string formatted, but becomes single byte later
    }
    return s;
}

function removeClassName(elem, className) {
    elem.classList.remove(className);
}

function addClassName(elem, className) {
    elem.classList.add(className);
}

//<--> RIGHT-CLICK CONTEXT MENU STUFF START <-->//
var ctxMenu;
var ctxMenuList;
var ctxMenuOpenInNewTab;
var ctxMenuOpenVidInNewTab;
var ctxMenuSaveAs;
var ctxMenuSaveAsVid;
var ctxMenuCopyImg;
var ctxMenuCopyAddress;
var ctxMenuCopyVidAddress;
var ctxMenuGRIS;
var ctxMenuShowDefault;

function initializeCtxMenu() {
    ctxMenu = document.createElement('div');
    ctxMenu.style.zIndex = "500";
    ctxMenu.id = "contextMenu";
    ctxMenu.className = "context-menu";
    ctxMenuList = document.createElement('ul');
    ctxMenu.appendChild(ctxMenuList);

    ctxMenuOpenInNewTab = createCtxMenuItem(ctxMenuList, "Open Image in New Tab");
    ctxMenuOpenVidInNewTab = createCtxMenuItem(ctxMenuList, "Open Video in New Tab");
    if (is_chrome) {
        let hideElem = document.createElement('div');
        ctxMenuOpenVidInNewTab.style.display = "none";
        hideElem.appendChild(ctxMenuOpenVidInNewTab);
        ctxMenuOpenVidInNewTab = hideElem;
    }
    ctxMenuSaveAs = createCtxMenuItem(ctxMenuList, "Save Image As");
    ctxMenuSaveAsVid = createCtxMenuItem(ctxMenuList, "Save Video As");
    ctxMenuCopyImg = createCtxMenuItem(ctxMenuList, "Copy Image");
    ctxMenuCopyAddress = createCtxMenuItem(ctxMenuList, "Copy Image Link");
    ctxMenuCopyVidAddress = createCtxMenuItem(ctxMenuList, "Copy Video Link");
    ctxMenuGRIS = createCtxMenuItem(ctxMenuList, "Search Google for Image");
    ctxMenuShowDefault = createCtxMenuItem(ctxMenuList, "Show Default Context Menu");

    document.body.appendChild(ctxMenu);
    document.body.addEventListener('click', function (e) {
        setContextMenuVisible(false);
    });

    setContextMenuVisible(false);

    window.addEventListener('locationchange', function () {
        setContextMenuVisible(false);
    });
    window.addEventListener('popstate', () => {
        setContextMenuVisible(false);
    });
}

function createCtxMenuItem(menuList, text) {
    let menuItem = document.createElement('LI');
    menuItem.innerText = text;
    menuList.appendChild(menuItem);
    return menuItem;
}

function mouseX(evt) {
    if (evt.pageX) {
        return evt.pageX;
    } else if (evt.clientX) {
        return evt.clientX + (document.documentElement.scrollLeft ?
            document.documentElement.scrollLeft :
            document.body.scrollLeft);
    } else {
        return null;
    }
}

function mouseY(evt) {
    if (evt.pageY) {
        return evt.pageY;
    } else if (evt.clientY) {
        return evt.clientY + (document.documentElement.scrollTop ?
            document.documentElement.scrollTop :
            document.body.scrollTop);
    } else {
        return null;
    }
}

function setContextMenuVisible(visible) {
    ctxMenu.style.display = visible ? "block" : "none";
}

var selectedShowDefaultContext = false;
//To avoid the value being captured when setting up the event listeners.
function wasShowDefaultContextClicked() {
    return selectedShowDefaultContext;
}

class SelectionCtx{
    constructor(postData, targetElem, isImage, isVideo, vidElem = null) {
        this.postData = postData;
        this.targetElem = targetElem;
        this.isImage = isImage;
        this.isVideo = isVideo;
        this.vidElem = vidElem;
    }

    get VideoSource() {
        return this.postData.VideoSource;
    }

    get ImageData() {
        return this.postData.getImageDataFromURL(this.targetElem.src);
    }
}

async function updateContextMenuLink(selContext) {
    if (selContext == null) {
        return;
    }

    ctxMenu.setAttribute('selection', selContext);

    let isImage = selContext.isImage;

    let imgVisibility = isImage ? "block" : "none";
    let vidVisibility = !isImage ? "block" : "none";

    ctxMenuOpenInNewTab.style.display = imgVisibility;
    ctxMenuSaveAs.style.display = imgVisibility;
    ctxMenuCopyImg.style.display = imgVisibility;
    ctxMenuCopyAddress.style.display = imgVisibility;
    ctxMenuGRIS.style.display = imgVisibility;

    ctxMenuOpenVidInNewTab.style.display = vidVisibility;
    ctxMenuSaveAsVid.style.display = vidVisibility;
    ctxMenuCopyVidAddress.style.display = vidVisibility;

    const copyAddress = function (url) {
        setContextMenuVisible(false);
        navigator.clipboard.writeText(url);
    };
    const openInNewTab = function (url) {
        setContextMenuVisible(false);
        if (GM_OpenInTabMissing) {
            let lastWin = unsafeWindow;
            unsafeWindow.open(url, '_blank');
            lastWin.focus();
        } else {
            GM_openInTab(url, {
                active: false,
                insert: true,
                setParent: true,
                incognito: false
            });
        }
    };

    //Image Context
    if (isImage == true) {
        ctxMenuOpenInNewTab.onclick = () => {
            openInNewTab(selContext.ImageData.urlSRC);
        };
        ctxMenuSaveAs.onclick = () => {
            setContextMenuVisible(false);
            selContext.postData.downloadImageClicked(selContext.targetElem.src);
        };

        ctxMenuCopyImg.onclick = async() => {
            setContextMenuVisible(false);
            try {
                GM.xmlHttpRequest({
                    method: 'GET',
                    url: selContext.ImageData.urlSRC,
                    responseType: 'blob',
                    onload: ({
                        status,
                        response
                    }) => {
                        if (status !== 200) {
                            return void alert(`Error loading: ${selContext.ImageData.urlSR}`);
                        }
                        let imgBlob = unsafeWindow.URL.createObjectURL(response);

                        let c = document.createElement('canvas');
                        var img = new Image();
                        var ctx = c.getContext('2d');
                        img.onload = async function () {
                            c.width = img.width;
                            c.height = img.height;
                            ctx.drawImage(img, 0, 0);
                            c.toBlob((png) => {
                                navigator.clipboard.write([new ClipboardItem({
                                            [png.type]: png
                                        })]);
                            }, "image/png", 1);
                        };
                        img.src = imgBlob;
                    },
                });
            } catch (err) {
                console.log(err);
            };
        };
        ctxMenuCopyAddress.onclick = (e) => {
            copyAddress(selContext.ImageData.urlSRC);
        };
        ctxMenuGRIS.onclick = () => {
            setContextMenuVisible(false);
            unsafeWindow.open("https://www.google.com/searchbyimage?sbisrc=cr_1_5_2&image_url=" + selContext.ImageData.url);
        };
    } else //Video
    {
        ctxMenuOpenVidInNewTab.onclick = () => {
            openInNewTab(selContext.VideoSource);
        };
        if (!selContext.targetElem.hasAttribute("downloading")) {
            ctxMenuSaveAsVid.onclick = async() => {
                selContext.targetElem.setAttribute("downloading", "");
                setContextMenuVisible(false);
                await selContext.postData.downloadVideoButtonClicked();
                selContext.targetElem.removeAttribute("downloading");
            };
        } else {
            ctxMenuSaveAsVid.style.display = "none";
        }

        ctxMenuCopyVidAddress.onclick = () => {
            copyAddress(selContext.postData.VideoSource)
        };
    }

    //Generic Stuff
    ctxMenuShowDefault.onclick = () => {
        selectedShowDefaultContext = true;
        setContextMenuVisible(false);
    };
}

function addCustomCtxMenu(selContext) {
    if (addHasAttribute(selContext.targetElem, "bskyEN_customctx")) {
        return;
    }

    selContext.targetElem.addEventListener('contextmenu', function (e) {
        e.stopPropagation();

        let curSel = ctxMenu.getAttribute('selection');

        if (wasShowDefaultContextClicked()) { //Skip everything here and show default context menu
            selectedShowDefaultContext = false;
            return;
        }

        e.preventDefault();

        if (ctxMenu.style.display != "block" || (curSel == null || (curSel != null && curSel != selContext))) {
            updateContextMenuLink(selContext);
            setContextMenuVisible(true);
            ctxMenu.style.left = -12.0 + mouseX(e) + "px";
            ctxMenu.style.top = -10.0 + mouseY(e) + "px";
        } else {
            setContextMenuVisible(false);
        }

    }, {
        capture: true
    }, true);
}

/*** OVERRIDES ***/


async function checkCreateRecordForFollow(record) {
    if (record && record?.record && record.record.$type?.includes('graph.follow')) {
        let did = record.record.subject;
        let cachedUser = BSKYUser.cache.get(did);
        if (cachedUser) {
            cachedUser.setFollowing(1);
        }
    }
}

async function getLikedPosts(likesRec, container) {
    let likeQuery = encodeURIComponent(likesRec.records[0].value.subject.uri);
    for (let i = 1; i < likesRec.records.length; i++) {
        likeQuery += '&uris=' + encodeURIComponent(likesRec.records[i].value.subject.uri);
    }

    likeQuery = 'https://bsky.social/xrpc/app.bsky.feed.getPosts?uris=' + likeQuery;
    const likePostsResp = await originalFetch(likeQuery, {
        "headers": {
            "accept": '*//*',
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "en-US,en;q=0.9",
            "authorization": container.bear,
        },
        "body": null,
        "origin": "https://bsky.app",
        "referer": "https://bsky.app/",
        "method": "GET",
        "mode": "cors"
    });
  if(likePostsResp.ok)
  {
      let likedPosts = await likePostsResp.json();
      let removedCnt = 0;

    console.log(likedPosts);
    let postCnt = likedPosts.posts.length;
    let posts = [];
    for (let p = 0; p < postCnt; p++)
    {
      if (removedCnt > (postCnt - 2) || Object.hasOwn(likedPosts.posts[p], 'embed'))
      {
          posts.push({post: likedPosts.posts[p]});
      }
      else
      {
          removedCnt += 1;
      }
    }
    container.newPosts = posts;
    console.log("found liked posts");
    console.log(posts);
   // return posts;
    
  } else { console.log("failed likes get");}
  
 // return [];
}


async function fetchPreReact(ref, resource, config)
{
	ref.isGetSession = (resource?.constructor === URL && resource.href.includes('server.getSession'));
	ref.isRequest = resource?.constructor === Request;

	if (!ref.isGetSession && ref.isRequest && resource.url.includes('repo.createRecord')) {
		resource.clone().json().then(checkCreateRecordForFollow);
	}
	if (ref.isGetSession) {
    console.log("get session");
    console.log(config?.headers);
		if (config?.headers?.has("authorization")) {
			console.log("get bear");
			let bearing = config?.headers?.get("authorization");
			//window.stateProps.bear = bearing;
			console.log(bearing);
			window.stateProps.bear = bearing;
		}
	} 
  else if (window.stateProps.useLikesList === true && ref.isRequest && resource.url.includes('.getAuthorFeed?') && resource.url.includes('=posts_with_replies'))
  {
    console.log("use likes list");
		let did = resource.url.split('actor=').at(-1).split('&')[0];

		let cursor = "";
		if (!resource.url.includes('cursor=')) {
			window.stateProps.lastCursor = "";
		}

		let feedObj = {
			feed: []
		};
    window.stateProps.likeFeed = feedObj;
		let likesRecReq = new Request(`https://bsky.social/xrpc/com.atproto.repo.listRecords?collection=app.bsky.feed.like&limit=25&filter=posts_with_media&reverse=false&cursor=${window.stateProps.lastCursor}&repo=${did}`, resource);
		const likesRecResp = await originalFetch(likesRecReq, config);
		let likesRec = await likesRecResp.json();
		if (likesRec)
    {
			let recordCnt = likesRec.records.length;
			if (Object.hasOwn(likesRec, 'cursor')) {
				window.stateProps.lastCursor = likesRec.cursor;
				feedObj.cursor = window.stateProps.lastCursor;
			}
			if (recordCnt > 0) {
        console.log("get posties");
				await getLikedPosts(likesRec, window.stateProps);
        console.log("got postiess");
        console.log(window.stateProps.newPosts);
        feedObj.feed = window.stateProps.newPosts;
				if (feedObj.feed.length > 0) {
					tryProcessFeedData(feedObj);
					modifyTagsText(feedObj);
				}
			}
			if (recordCnt < 25) {
				delete feedObj.cursor;
			}
		}
		ref.response = new Response(JSON.stringify(feedObj), {
			status: likesRecResp.status,
			statusText: likesRecResp.statusText,
			headers: likesRecResp.headers
		});
		return true;
	} else
  {
     console.log("skipped likes list");
  }
   return false;
}

async function fetchPostReact(ref, resource, config)
{
   if (ref.isGetSession) {
        var sessionData = await ref.response.clone().json();
        window.stateProps.did = cloneInto(sessionData?.did, window);
    } else if (ref.isRequest && resource?.url.includes('bsky.feed.')) {
        let json = await ref.response.json();
        tryProcessFeedData(json);
        modifyTagsText(json);

        ref.response = new Response(JSON.stringify(json), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
    }
}

var stateProps = { useLikesList: false, lastCursor: "", bear:"", did:null};
  var bear = {key:""};
var bsNet = {};


const w = window.wrappedJSObject;
const windowRef = w != null ? w : unsafeWindow;




if (w) {
	w.stateProps = stateProps;
	exportFunction(getLikedPosts, window, {defineAs:"getLikedPosts", allowCrossOriginArguments: true});
  exportFunction(fetchPreReact, window, {defineAs:"fetchPreReact", allowCrossOriginArguments: true});
  exportFunction(fetchPostReact, window, {defineAs:"fetchPostReact", allowCrossOriginArguments: true});
  exportFunction(tryProcessFeedData, window, {defineAs:"tryProcessFeedData", allowCrossOriginArguments: true});
  exportFunction(getTagFacet, window, {defineAs:"getTagFacet", allowCrossOriginArguments: true});
  exportFunction(modifyTagsText, window, {defineAs:"modifyTagsText", allowCrossOriginArguments: true});
  exportFunction(byteLengthCharCode, window, {defineAs:"byteLengthCharCode", allowCrossOriginArguments: true});
  exportFunction(checkCreateRecordForFollow, window, {defineAs:"checkCreateRecordForFollow", allowCrossOriginArguments: true});
  
  w.eval("window.originalFetch = window.fetch");
  w.eval(`window.getLikedPosts = ${getLikedPosts}`);
  //w.eval(`window.tryProcessFeedData = ${tryProcessFeedData}`);
  //w.eval(`window.getTagFacet = ${getTagFacet}`);
 // w.eval(`window.modifyTagsText = ${modifyTagsText}`);
//  w.eval(`window.byteLengthCharCode = ${byteLengthCharCode}`);
//  w.eval(`window.checkCreateRecordForFollow = ${checkCreateRecordForFollow}`);
  
  w.eval(`window.fetchPreReact = ${fetchPreReact}`);
	w.eval(`window.fetchPostReact = ${fetchPostReact}`);
  w.eval(`window.stateProps = { useLikesList: false, lastCursor: ""}`);

  
  w.eval(`window.fetch = ${async (...args) => {
    let [resource, config] = args;
    
    this.response = null;

    
    let preFetch = await window.fetchPreReact(this, resource, config);
    if(preFetch === true)
    {
      console.log("did prefetch");
   		return this.response;
    }
    this.response = await window.originalFetch(resource, config);
    await window.fetchPostReact(this, resource, config);

    return this.response;
  }}`);
} else {
  const { fetch: originalFetch } = unsafeWindow;
  var bear = "";
	unsafeWindow.stateProps = stateProps;
  unsafeWindow.fetch = async (...args) => {
    let [resource, config] = args;
    this.response = null;
    
  //  const preFetch = await fetchPreReact(this, resource, config);
   // if(preFetch === true) { 
   //      console.log("returned prefetch");
   //   return this.response;
  //  }
    this.response = await originalFetch(resource, config);
   // await fetchPostReact(this, resource, config);

    return this.response;
  };
}



const filterVideoSources = function (m3u8) {
    const bandwidth_regex = /(?<=,BANDWIDTH=)([0-9]*)(?=,)/gm;
    let bestLine = 0;
    let bestBitrate = 0;
    let new_playlist = "";

    let lines = m3u8.split('#');

    for (let i = 1; i < lines.length; i++) {
        let line = lines[i];

        if (line.includes('STREAM-INF:')) {
            let bitrate = parseInt(line.match(bandwidth_regex));
            if (bitrate > bestBitrate) {
                bestBitrate = bitrate;
                bestLine = i;
            }
        } else {
            new_playlist += '#' + line;
        }
    }

    if (bestLine == 0) {
        bestLine = Math.max(0, lines.length - 1);
    }

    new_playlist += '#' + lines[bestLine];

    return new_playlist;
};

function processXMLOpen(thisRef, method, url) {
    thisRef.addEventListener('readystatechange', function (e) {
        const m3uText = e.target.responseText;
        if (m3uText.includes('#EXT-X-STREAM-INF')) {
            let m3u = filterVideoSources(m3uText);
            Object.defineProperty(thisRef, 'response', {
                writable: true
            });
            Object.defineProperty(thisRef, 'responseText', {
                writable: true
            });
            thisRef.response = thisRef.responseText = m3u;
        }
    });
}

var openOpen = unsafeWindow.XMLHttpRequest.prototype.open;
unsafeWindow.XMLHttpRequest.prototype.open = exportFunction(function (method, url) {
    if (url.endsWith('playlist.m3u8')) {
        processXMLOpen(this, method, url);
    }
    openOpen.call(this, method, url);
}, unsafeWindow);

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
(async function () {
    console.log("start userscript");
    initializeCtxMenu();

    let root = await awaitElem(document, 'body #root', argsChildAndSub);
    onNewPageLoaded();

})();
