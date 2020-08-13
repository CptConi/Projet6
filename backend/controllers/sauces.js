const Sauce = require("../models/sauce");
const fs = require("fs");
const { restart } = require("nodemon");


// Renvoie le tableau detoutes les sauces dansla base de données
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};
// Renvoie la sauce avecl'ID fourni
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

// Capture et enregistre l'image, analyse la sauce en utilisant une chaîne de caractères
// et l'enregistre dans la base de données, en définissant correctement son image URL.
// Remet les sauces aimées et celles détestées à 0, et les sauces usersliked et celles usersdisliked aux tableaux vides.
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    userId: sauceObject.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    
    likes: 0,
    dislikes: 0,
    userLiked: null,
    userDisliked: null,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce initialisée" }))
    .catch((error) => res.status(400).json({ error }));
};
// exports.likeSauce = (req, res, next) => {};
// exports.modifySauce = (req, res, next) => {};
// exports.deleteSauce = (req, res, next) => {};
