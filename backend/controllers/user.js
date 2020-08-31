const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = (req, res, next) => {
  // //Test robustesse du password:
  //    - 8 caractères ou plus
  //    - 1 minuscule
  //    - 1 majuscule
  //    - 1 caractère spécial
  //    - 1 caractère numérique
  // RegEx from https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript/
  const regEx = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
  );
  if (regEx.test(req.body.password)) {
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => {
        const user = new User({
          email: req.body.email,
          password: hash,
        });
        user
          .save()
          .then(() =>
            res.status(201).json({
              message: "Utilisateur créé !",
            })
          )
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(500).json({ error }));
  } else {
    res.status(400).json({
      message:
        "Format du mot de passe incorrect: pas assez robuste. Doit contenir 8 caractères ou plus, dont 1 minuscule et 1 majuscule, un caractère spécial !@#$%^&* et un chiffre",
    });
  }
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              "$2y$10$2SdudjltuB/OPGapUTJeGem/Lv2gmPiewBz5hAASr.dOvMDucCQ4K",
              {
                expiresIn: "2h",
              }
            ),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
