FROM node:6

RUN mkdir -p /home/node/xsscheck
WORKDIR /home/node/xsscheck

COPY . /home/node/xsscheck
RUN npm install --production

CMD ["node", "xsscheck.js"]
