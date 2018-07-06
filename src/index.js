const app = require("./app");
const debug = require("debug")("server:server");
const http = require("http");

const port = process.env.PORT || 3030;

app.set("port", port);
http.createServer(app).listen(port, () => {
  console.log(`This app listen on port ${port}`);
});
