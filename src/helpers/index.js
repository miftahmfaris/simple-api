const jwt = require("jsonwebtoken");

const Account = require("../api/accounts/model");

module.exports = {
  generateJWT: content => {
    const token = jwt.sign(content.payload, content.secret, content.options);
    return token;
  },

  setLoggedIn: (body, condition) => {
    Account.findOneAndUpdate(
      {
        id: body.id
      },
      {
        $set: {
          login: condition
        }
      },
      {
        new: true
      },
      (error, resource) => {
        console.log(`Account is logged out`);
      }
    );
  },

  isAuthenticated: (req, res, next) => {
    const token =
      req.body.token ||
      req.query.token ||
      req.headers.authorization.split(" ")[1] ||
      undefined;

    console.log({ token });

    if (token !== undefined) {
      jwt.verify(token, process.env.JWT_SECRET, (error, decode) => {
        if (error) {
          res.send({
            message: "Failed to authenticate token",
            error: error
          });
        } else {
          req.decoded = decoded;
        }

        Account.findById(decoded.sub, (error, account) => {
          if (error || !account) {
            res.send({
              message: "No account is associated with that token",
              error: error
            });
          } else {
            return next();
          }
        });
      });
    } else {
      res.status(400).send({
        message: "Sorry, you do not have access"
      });
    }
  }
};
