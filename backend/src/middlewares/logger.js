const fs = require("fs");
const path = require("path");

const serverLogStream = fs.createWriteStream(
  path.join(process.cwd(), "server.log"),
  {
    flags: "a",
  },
);

module.exports = serverLogStream;
