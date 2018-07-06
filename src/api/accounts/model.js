const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const sequence = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;

const modelName = "Account";

const SALT_WORK_FACTOR = 8;

const schema = new Schema({
  fullName: {
    type: String
  },
  email: {
    type: String,
    unique: true
  },
  password: String,
  currentPassword: String,
  retypePassword: String,
  phoneNumber: {
    type: Number,
    unique: true
  }
});

schema.plugin(sequence, {
  id: "account_counter",
  inc_field: "id"
});

schema.pre("save", function(next) {
  if (!this.isModified("password")) return next();
  else {
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
      if (err) return next(err);
      else {
        bcrypt.hash(this.password, salt, (err, hash) => {
          if (err) return next(err);
          else {
            this.password = hash;
            this.hash = hash;
            this.salt = salt;
            return next();
          }
        });
      }
    });
  }
});

// schema.pre("findOneAndUpdate", function(next) {
//   if (!this.isModified("password")) return next();
//   else {
//     bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
//       if (err) return next(err);
//       else {
//         bcrypt.hash(this.password, salt, (err, hash) => {
//           if (err) return next(err);
//           else {
//             this.password = hash;
//             this.hash = hash;
//             this.salt = salt;
//             return next();
//           }
//         });
//       }
//     });
//   }
// });

schema.pre("find", function(next) {
  this.select({
    password: 0
  });
  next();
});

schema.pre("findOne", function(next) {
  this.select({ hash: 0, salt: 0 });
  next();
});

module.exports = mongoose.model(modelName, schema);
