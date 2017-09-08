const fs = require('fs');
const co = require('co');
const url = require('url');
const phantom = require('phantom');
const readlineSync = require('readline-sync');
const qs = require('querystring');

const banner = '\n=======> XSScheck Power By VLVK <========\n';

function xsscheck () {
  let payloads = [];
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
    let lst = fs.readFileSync(file, 'utf-8').split('\r\n');
    for (x in lst) {
      let payload = lst[x].trim();
      if (payload !== '') {
        payload = payload.replace(/=([^"]*?)([ |>])/g, ('="$1"$2'));
        payloads.push(payload);
      }
    }
  }
  function checkInResponse (target, path, payload, para, method, data = null) {
    if (method === 'GET') {
      co(function*() {
        let instance = yield phantom.create();
        try {
          let page = yield instance.createPage();
          let status = yield page.open(target);
          // console.log(status);
          let content = yield page.property('content');
          if (content.indexOf(payload) !== -1 ) {
            console.log('====================');
            console.log('Path: ' + path);
            console.log('Method: GET');
            console.log('Parameter: ' + para);
            console.log('Payload: ' + payload);
            console.log('Href: ' + target);
            console.log('====================');
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
          let postdata = qs.unescape(qs.stringify(data));
          let status = yield page.open(target, 'POST', postdata);
          // console.log(status);
          let content = yield page.property('content');
          if (content.indexOf(payload) !== -1 ) {
            console.log('====================');
            console.log('Path: ' + path);
            console.log('Method: Post');
            console.log('Parameter: ' + para);
            console.log('Payload: '+ payload);
            console.log('Data: ' + postdata);
            console.log('====================');
          }
        } catch (e) {
          console.log('Error found: ' + e.message);
        } finally {
          instance.exit();
        }
      }).catch(console.error);
    }
  }
  function GET_Method () {
    let site = readlineSync.question('[?] Enter URL:\n[?] > '); // URL
    if (site.indexOf('http://') === -1 && site.indexOf('https://') === -1) {
      site = 'http://' + site;
    }
    let oriurl = url.parse(site, true);
    let payloadlist = readlineSync.question('[?] Enter location of Payloadlist (payloads.txt)\n[?] > ');
    if (payloadlist === '') {
      loadpayload();
      console.log('[+] Use Default payloads...');
    } else {
      loadpayload(payloadlist);
    }
    let parameters = oriurl.query;
    let path = oriurl.protocol + '//' + oriurl.host + oriurl.pathname;
    let flag = false;
    for (x in payloads) {
      // GET XSS
      for (para in parameters) {
        let readyurl = JSON.parse(JSON.stringify(parameters));
        readyurl[para] += payloads[x];
        let target = path + '?' + qs.stringify(readyurl) + hashes;
        checkInResponse(target, path, payloads[x], para, 'GET')
      }
      // DOM XSS
      if (oriurl.hash !== '') {
        let target = site + encodeURI(payloads[x]);
        checkInResponse(target, path, payloads[x], oriurl.hash, 'GET')
      }
    }
  }
  function POST_Method () {
    let site = readlineSync.question('[?] Enter URL:\n[?] > '); // URL
    if (site.indexOf('http://') === -1 && site.indexOf('https://') === -1) {
      site = 'http://' + site;
    };
    let parameter = readlineSync.question('[?] Enter Parameters:\n[?] > ');
    let parameters = qs.parse(parameter);
    let payloadlist = readlineSync.question('[?] Enter location of Payloadlist (payloads.txt)\n[?] > ');
    if (payloadlist === '') {
      loadpayload();
      console.log('[+] Use Default payloads...');
    } else {
      loadpayload(payloadlist);
    }
    for (x in payloads) {
      for (para in parameters) {
        let paras = JSON.parse(JSON.stringify(parameters));
        paras[para] += payloads[x];
        checkInResponse(site, site, payloads[x], para, 'POST', paras);
      }
    }
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
