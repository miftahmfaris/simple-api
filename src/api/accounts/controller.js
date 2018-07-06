const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Account = require("./model");
const helpers = require("../../helpers");

module.exports = {
  //GET /accounts
  get: (req, res) => {
    Account.find({})
      .populate({ path: "posts" })
      .exec((err, accounts) => {
        res.send({
          data: accounts
        });
      });
  },

  //GET /accounts/:id
  getById: (req, res) => {
    Account.findOne({ id: Number(req.params.id) }, (err, account) => {
      res.send({
        params: req.params,
        data: account
      });
    });
  },

  //POST /accounts
  register: (req, res) => {
    const payload = {
      fullName: req.body.fullName || "",
      email: req.body.email || "",
      password: req.body.password || "",
      phoneNumber: req.body.phoneNumber || ""
    };

    const newAccount = new Account(payload);
    delete payload.password;
    console.log(payload);

    newAccount.save(payload, (err, resource) => {
      if (err) return res.send(err);
      else {
        res.status(200).send({ message: "Register Success", data: resource });
      }
    });
  },

  //POST /accounts/signin
  login: (req, res) => {
    const body = {
      email: req.body.email,
      password: req.body.password
    };

    Account.findOne({ email: body.email })
      .then(account => {
        console.log("body", body.password);
        console.log("account", account.password);
        const validPassword = bcrypt.compareSync(
          body.password,
          account.password
        );

        if (account == null) {
          res.send({
            message: `Login failed because account with email ${
              body.email
            } is not found`
          });
        } else if (!validPassword) {
          res.send({
            message: `Sign in failed because your email or password is incorrect`
          });
        } else {
          let content = {
            payload: {
              email: account.username,
              fullName: account.fullName
            },
            secret: process.env.JWT_SECRET,
            options: {
              expiresIn: "30d"
            }
          };

          const token = helpers.generateJWT(content);

          helpers.setLoggedIn(account, true);
          res.send({
            message: `Your successfully logged in`,
            fullName: account.fullName,
            email: body.email,
            password: account.password,
            id: account.id,
            token: token
          });
        }
      })
      .catch(err => {
        console.log(err);
        if (err) {
          res.send({
            message: `Something wrong when try to logging in`
          });
        }
      });
  },

  // PUT /accounts/:id
  putById: (req, res) => {
    const newUser = {
      fullName: req.body.fullName || "",
      email: req.body.email || "",
      phoneNumber: req.body.phoneNumber || "",
      password: req.body.password || ""
    };
    const id = req.params.id;
    Account.findOneAndUpdate(
      {
        id: Number(id)
      },
      {
        $set: newUser
      },
      {
        new: true,
        upsert: false
      },
      (error, resource) => {
        if (error) return res.send({ message: "error when updating post" });
        res.send({
          message: `Account with id: ${id} has been updated`,
          data: resource
        });
      }
    );
  },

  // PUT /accounts/password/:id
  putPasswordById: (req, res) => {
    const payload = {
      password: req.body.password || "",
      currentPassword: req.body.currentPassword || ""
    };
    const id = req.params.id;

    Account.findOne({ id: id })
      .then(account => {
        console.log("findPayload", payload.password);
        console.log("findAccount", account.password);
        const validPassword = bcrypt.compareSync(
          payload.password,
          account.password
        );
        if (!validPassword) {
          res.send({
            message: `Sign in failed because your old password is incorrect`
          });
        } else {
          Account.findOneAndUpdate(
            {
              id: id
            },
            {
              $set: { password: payload.currentPassword }
            },
            (error, resource) => {
              if (error)
                return res.send({ message: "error when updating post" });
              res.send({
                message: `Account with id: ${id} has been updated`,
                data: resource
              });
            }
          );
          // res.send({
          //   message: `Your successfully logged in`,
          //   fullName: account.fullName,
          //   password: account.password,
          //   id: account.id
          // });
        }
      })
      .catch(err => {
        console.log(err);
        if (err) {
          res.send({
            message: `Something wrong when update`
          });
        }
      });
  },

  //DELETE /accounts
  delete: (req, res) => {
    Account.remove({}, error => {
      if (err) res.status(400).json({ error: error });
      res.status(200).send({ message: "All Accounts have been deleted" });
    });
  },

  //DELETE /accounts/:id
  deleteById: (req, res) => {
    const id = req.params.id;
    Account.remove(
      {
        id: Number(id)
      },
      (err, resource) => {
        res.send({
          message: `Account with id:${id} has been delete`
        });
      }
    );
  }
};
