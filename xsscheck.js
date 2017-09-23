#!/usr/bin/env node

const co = require('co');
const fs = require('fs');
const url = require('url');
const async = require('async');
const qs = require('querystring');
const phantom = require('phantom');
const program = require('commander');

const banner = '\n=======> XSScheck By VLVK <========\n';
let payloads = [];

function xsscheck () {
  function loadpayload (file) {
    payloads = [];
    let lst = [];
    if (process.platform === 'win32') {
      lst = fs.readFileSync(file, 'utf-8').split('\r\n');
    } else {
      lst = fs.readFileSync(file, 'utf-8').split('\n');
    }
    for (let x in lst) {
      let payload = lst[x].trim();
      if (payload !== '') {
        payload = payload.replace(/=([^"]*?)([ |>])/g, ('="$1"$2'));
        payloads.push(payload);
      }
    }
  }
  function checkInResponse (target, callback) {
    co(function*() {
      let instance = yield phantom.create();
      try {
        let page = yield instance.createPage();
        if (target['method'] === 'GET') {
          let status = yield page.open(target.href);
        } else {
          target['postdata'] = qs.unescape(qs.stringify(target.paras));
          let status = yield page.open(target.site, 'POST', target.postdata);
        }
        // console.log(status);
        let content = yield page.property('content');
        if (content.indexOf(target.payload) !== -1 ) {
          showResult(target);
          callback(null, '1');
        } else {
          callback(null, '0');
        }
      } catch (e) {
        console.log('Error found: ' + e.message);
      } finally {
        instance.exit();
      }
    }).catch(console.error);
  }
  function showResult (result) {
    console.log('======================================');
    console.log('Path: ' + result['site']);
    console.log('Method: ' + result['method']);
    console.log('Parameter: ' + result['para']);
    console.log('Payload: '+ result['payload']);
    if (result['method'] === 'POST') {
      console.log('Postdata: ' + result['postdata']);
    } else {
      console.log('Href: ' + result['href']);
    }
    console.log('======================================');
  }
  function GET_Method (arguments) {
    let site = arguments.url;
    if (site.indexOf('http://') === -1 && site.indexOf('https://') === -1) {
      site = 'http://' + site;
    }
    let oriurl = url.parse(site, true);
    loadpayload(arguments.payloadfile);
    console.log('[+] Use Default payloads...');
    let allDatas = [];
    let parameters = oriurl.query;
    let path = oriurl.protocol + '//' + oriurl.host + oriurl.pathname;
    let flag = false;
    for (x in payloads) {
      // GET XSS
      for (para in parameters) {
        let readyurl = JSON.parse(JSON.stringify(parameters));
        readyurl[para] += payloads[x];
        let target = path + '?' + qs.stringify(readyurl);
        target += oriurl.hash ? oriurl.hash : '';
        let onePiece = [];
        onePiece.payload = payloads[x];
        onePiece.para = para;
        onePiece.href = target;
        onePiece.site = path;
        onePiece.method = 'GET';
        allDatas.push(onePiece);
      }
      // DOM XSS
      if (oriurl.hash) {
        let target = site + encodeURI(payloads[x]);
        let onePiece = [];
        onePiece.payload = payloads[x];
        onePiece.para = oriurl.hash;
        onePiece.href = target;
        onePiece.site = path;
        onePiece.method = 'GET';
        allDatas.push(onePiece);
      }
    }
    async.mapLimit(
      allDatas,
      arguments.threads,
      (allData, callback) => {
        checkInResponse(allData, callback);
      },
      (err, result) => {
        for (let x in result) {
          if (result[x] === '1') {
            process.exit(0);
          }
        }
        console.log(arguments.url + ' is not vunluntity!');
      }
    );
  }
  function POST_Method (arguments) {
    let site = arguments.url; // URL
    if (site.indexOf('http://') === -1 && site.indexOf('https://') === -1) {
      site = 'http://' + site;
    };
    let parameter = arguments.data;
    let parameters = qs.parse(parameter);
    loadpayload(arguments.payloadfile);
    console.log('[+] Loading payloads...');
    let allDatas = [];
    for (x in payloads) {
      for (para in parameters) {
        let paras = JSON.parse(JSON.stringify(parameters));
        paras[para] += payloads[x];
        // checkInResponse(site, site, payloads[x], para, 'POST', paras);
        let onePiece = [];
        onePiece.payload = payloads[x];
        onePiece.para = para;
        onePiece.paras = paras;
        onePiece.site = site;
        onePiece.method = 'POST';
        allDatas.push(onePiece);
      }
    }
    async.mapLimit(
      allDatas,
      arguments.threads,
      (allData, callback) => {
        checkInResponse(allData, callback);
      },
      (err, result) => {
        for (let x in result) {
          if (result[x] === '1') {
            process.exit(0);
          }
        }
        console.log(arguments.url + ' is not vunluntity!');
      }
    );
  }

  // main
  console.log(banner);
  program
    .version('0.0.1')
    .option('-m, --method [value]', 'GET/POST Method [GET]', 'GET')
    .option('-d, --data [value]', 'POST Data (only POST method)')
    .option('-t, --threads <n>', 'Threads of Testing', 4)
    .option('-u, --url [value]', 'Target of URL')
    .option('-r, --payloadfile [value]', 'location of Payload', 'payloads.txt')
    .parse(process.argv);
  switch (program.method) {
    case 'GET':
      GET_Method(program);
      break;
    case 'POST':
      POST_Method(program);
      break;
    default:
      process.exit(0);
  }
}

xsscheck();