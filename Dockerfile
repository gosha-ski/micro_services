FROM node:18.18.1

RUN npm install

COPY ./src .

CMD ["npm", "product_controller"]