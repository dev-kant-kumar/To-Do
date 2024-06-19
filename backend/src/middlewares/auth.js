const jwt = require("jsonwebtoken");
const SECRET_KEY = "de3u23h3j!2gwt";
function auth(req, res, next) {
  const token = req.headers["x-authorization"];
  if (token) {
    const finalToken = token.split(" ")[1];
    try {
      const decodedToken = jwt.verify(finalToken, SECRET_KEY);

      const username = decodedToken.username;
      const userID = decodedToken.id;

      req.username = username;
      req.id = userID;
      next();
    } catch (err) {
      res.send({
        status: false,
        message: "Invalid token!",
      });
    }
  } else {
    res.send({
      status: false,
      message: "No token found!",
    });
  }
}

module.exports = auth;
