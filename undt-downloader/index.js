#!/usr/bin/env node
"use strict";

const async = require("async");
const fs = require("fs");
const http = require("http");
const path = require('path');
var urlParser = require("url");

const MAX_PARALLEL_DOWNLOADS = 3;

var decisions = require('../judgements.json');

var urls = extractUrls(decisions);

async.eachLimit(
    urls,
    MAX_PARALLEL_DOWNLOADS,
    (url, next) => {
        download(
            url,
            path.basename(urlParser.parse(url).pathname),
            next
        );
    },
    () => {
        console.log("Finished downloading");
    }
);

function extractUrls(decisions){
    var urls = [];
    for (let decision of decisions){
        for (let urlList of [decision.judgementUrls, decision.appealUrls]){
            for (let url of urlList){
                Object.getOwnPropertyNames(url).forEach(
                    function (val) {
                        urls.push((url[val]));
                    }
                );
            }
        }   
    }
    return urls;
}

function download (url, dest, next) {
    // need to handle errors, update status in json? 
    // only downloaded 2,825 of 3,121 files?
    console.log(`Downloading ${url} to ${dest}`);
    const file = fs.createWriteStream(dest);
    http.get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
            file.close();
            next();
        });
    });
};
