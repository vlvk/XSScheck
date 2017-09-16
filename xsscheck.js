const fs = require('fs');
const co = require('co');
const url = require('url');
const async = require('async');
const phantom = require('phantom');
const readlineSync = require('readline-sync');
const qs = require('querystring');

const banner = '\n=======> XSScheck Power By VLVK <========\n';
let payloads = [];

function xsscheck () {
  function again () {
    inq = readlineSync.question("[?] [E]xit or launch [A]gain? (e/a)").toLowerCase();
    switch (inq) {
      case 'e' :
        process.exit(0);
      case 'a' :
        xsscheck();
      default:
        console.log('[!] Incorrect option selected');
        again();
    }
  }
  function loadpayload (file = 'payloads.txt') {
    payloads = [];
    let lst = [];
    if (process.platform === 'win32') {
      lst = fs.readFileSync(file, 'utf-8').split('\r\n');
    } else {
      lst = fs.readFileSync(file, 'utf-8').split('\n');
    }
    for (x in lst) {
      let payload = lst[x].trim();
      if (payload !== '') {
        payload = payload.replace(/=([^"]*?)([ |>])/g, ('="$1"$2'));
        payloads.push(payload);
      }
    }
  }
  function checkInResponse (target, callback) {
    if (target['method'] === 'GET') {
      co(function*() {
        let instance = yield phantom.create();
        try {
          let page = yield instance.createPage();
          let status = yield page.open(target.href);
          let content = yield page.property('content');
          if (content.indexOf(target.payload) !== -1 ) {
            showResult(target);
            callback();
          }
        } catch (e) {
          console.log('Error found: ' + e.message);
        } finally {
          instance.exit();
        }
      }).catch(console.error);
    } else {
      co(function*() {
        let instance = yield phantom.create();
        try {
          let page = yield instance.createPage();
          target['postdata'] = qs.unescape(qs.stringify(target.paras));
          let status = yield page.open(target.site, 'POST', target.postdata);
          let content = yield page.property('content');
          if (content.indexOf(target['payload']) !== -1 ) {
            showResult(target);
            callback();
          }
        } catch (e) {
          console.log('Error found: ' + e.message);
        } finally {
          instance.exit();
        }
      }).catch(console.error);
    }
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
  function GET_Method () {
    let site = readlineSync.question('[?] Enter URL:\n[?] > '); // URL
    if (site.indexOf('http://') === -1 && site.indexOf('https://') === -1) {
      site = 'http://' + site;
    }
    let oriurl = url.parse(site, true);
    let payloadlist = readlineSync.question('[?] Enter location of Payloadlist (payloads.txt)\n[?] > ');
    let threadlimit = readlineSync.question('[?] Enter Threads of Testing (4)\n[?] > ');
    if (threadlimit === '') {
      threadlimit = 4;
    }
    if (payloadlist === '') {
      loadpayload();
      console.log('[+] Use Default payloads...');
    } else {
      loadpayload(payloadlist);
    }
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
      threadlimit,
      (allData, callback) => {
        checkInResponse(allData, callback);
      },
      (err) => {}
    );
  }
  function POST_Method () {
    let site = readlineSync.question('[?] Enter URL:\n[?] > '); // URL
    if (site.indexOf('http://') === -1 && site.indexOf('https://') === -1) {
      site = 'http://' + site;
    };
    let parameter = readlineSync.question('[?] Enter Parameters:\n[?] > ');
    let parameters = qs.parse(parameter);
    let payloadlist = readlineSync.question('[?] Enter location of Payloadlist (payloads.txt)\n[?] > ');
    let threadlimit = readlineSync.question('[?] Enter Threads of Testing (4)\n[?] > ');
    if (threadlimit === '') {
      threadlimit = 4;
    }
    if (payloadlist === '') {
      loadpayload();
      console.log('[+] Use Default payloads...');
    } else {
      loadpayload(payloadlist);
    }
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
      threadlimit,
      (allData, callback) => {
        checkInResponse(allData, callback);
      },
      (err) => {}
    );
  }

  // main
  console.log(banner);
  methodselect = readlineSync.question("[?] Select method: [G]ET or [P]OST (G/P): ").toLowerCase();
  switch (methodselect) {
    case 'g':
      GET_Method();
      break;
    case 'p':
      POST_Method();
      break;
    default:
      again();
  }
}

xsscheck();