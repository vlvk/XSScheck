# XSScheck

XSS scanner by nodejs


## Install

```
git clone https://github.com/vlvk/XSScheck.git
cd XSScheck
```

You can put custom payloads into 'payloads.txt' file.

1. Manual
```
npm install
node xsscheck.js
```

2. Docker
```
docker build -t xsscheck .
docker run -it xsscheck
```


## Usage

```
 > node xsscheck.js -h

  Usage: xsscheck <Options>
	 xsscheck -u www.example.com/xyz.php?a=1


  Options:

    -V, --version             output the version number
    -m, --method [value]      GET/POST Method [GET]
    -d, --data [value]        POST Data (only POST method)
    -t, --threads <n>         Threads of Testing
    -u, --url [value]         Target of URL
    -r, --payloadfile <path>  location of Payload
    -h, --help                output usage information
```

Example:

```
node xsscheck.js -u "http://testphp.vulnweb.com/search.php?test=query" -d "searchFor=1&goButton=go" -t 2 -m "POST"
```

## Todo

- [x] concurrent_control
- [ ] 10&16hex_encode