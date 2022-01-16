FROM node
COPY . .
RUN useradd -u 8877 nonroot-user
USER nonroot-user
CMD [ "node", "index.js" ]
EXPOSE 8090
