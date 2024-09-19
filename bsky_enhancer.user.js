// ==UserScript==
// @name         BSKY Enhancer
// @namespace    Invertex.BSKY
// @version      0.1
// @description  Quality of life improvements for BSKY
// @author       Invertex
// @match        https://bsky.app/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bsky.app
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// ==/UserScript==

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
                console.log("filtered m3u");
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
