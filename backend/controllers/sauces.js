const Sauce = require("../models/sauce");
const fs = require("fs");
const { restart } = require("nodemon");
const { lintSyntaxError } = require("tslint/lib/verify/lintError");

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

//  Met à jour la sauce avec l'identifiant fourni.
//  Si une image est téléchargée, capturez-la et mettez à jour l'image URL des sauces.
//  Si aucun fichier n'est fourni, les détails de la sauce figurent directement dans
//  le corps de la demande(req.body.name,req.body.heat etc).
//  Si un fichier est fourni, la sauce avec chaîne est en req.body.sauce
exports.modifySauce = (req, res, next) => {
  if (req.file) {
    //Suppression de l'ancienne image dans le stockage serveur:
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {});
      })
      .catch((error) => res.status(500).json({ error }));
    sauceObject = {
      //Une modif d'image est demandée
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`,
    };
  } else {
    sauceObject = { ...req.body };
    //Modif d'infos texte uniquement
  }
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Sauce modifiée" }))
    .catch((error) => res.status(400).json({ error }));
};

// Supprime la sauce avecl'ID fourni.
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

// exports.likeSauce = (req, res, next) => {};
