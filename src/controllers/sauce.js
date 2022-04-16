const Sauce = require('../models/sauce');
const fs = require('fs');
const regex = /^[a-f 0-9]{24}$/;

// Création d'une nouvelle sauce ! 
exports.createSauce = (req, res, next) => { //function de callback
  //Le corps de la requête contient une chaîne donc on doit le parse
  const sauceObject = JSON.parse(req.body.sauce);//extraire l'objet json (l'objet sauce de la requête)
  //body correspond au model de l'objet que l'on envoi (on eleve id l'objet sauce de la requête)
  delete sauceObject._id;// enlever le champ id (envoyé par le front-end) du corp de la requete (methode delete) car mongoos le genere automatiquement
  
  if((sauceObject.name) || 0 > sauceObject.name || sauceObject.name > 150){
    return res.status(400).json({ message: 'Ce nom est trop long / ou trop ne peut être vide' })
  }
  if(sauceObject.manufacturer.length > 150){
    return res.status(400).json({ message: 'Cette manufacturer est trop longue !' })
  }
  if(sauceObject.mainPepper.length > 150){
    return res.status(400).json({ message: 'Cette main Pepper est trop longue !' })
  }
  if(sauceObject.description.length > 150){
    return res.status(400).json({ message: 'Cette description est trop longue !' })
  }
  if(isNaN(sauceObject.heat) || 0 > sauceObject.heat || sauceObject.heat > 10){
    return res.status(400).json({ message: 'Cette heat ne peut être utilisée!' })
  }
  if(!regex.test(sauceObject.userId)){
    return res.status(400).json({ message: 'Cet id ne peut être utilisé!' })
  }
  //console.log('test');
  const sauce = new Sauce({/* creation d'une nouvelle instance  de mon objet sauce (class) de le req*/  
  ...sauceObject,// operateur spread (...) vas copier les champ de l'objet , dans le corp de la request 
  //http ou https puis le host de notre server (localhost:3000), la racine du serveur
  imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,//adresse de l'image en interpolation  host(nom de domaine ou ad ip)
  likes : 0,
  dislikes : 0,
  usersLiked : [],
  usersDisliked : []
  });
  sauce.save()//methode save enregistre l'objet dans la base de donnée renvoi une promise
  .then(() => res.status(201).json({ message: 'Objet enregistré !'}))//retourne une promise asynchrone qui attend ,201 la requête a réussi avec le message
  .catch(error => res.status(400).json({ message: `nous faisons face a cette: ${error}` }));
};

// Modification d'une sauce 
exports.updateOneSauce = (req, res , next) => {
  const sauceObject = req.file?
  { 
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
  .then(() => res.status(200).json({ message: 'Sauce modifiée!'}))
  .catch(error => res.status(404).json({ error }));
};

// Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    const filename = sauce.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, () => {
      sauce.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
      .catch(error => res.status(400).json({ error }));
    });
  })
  .catch(error => res.status(500).json({ error }));
};

// Trouver une sauce avec l'ID spécifique!
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
  .then(sauce => res.status(200).json(sauce))
  .catch(error => res.status(404).json({ error }));
};

// Récuperer toutes les sauces!
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
  .then(sauces => res.status(200).json(sauces))
  .catch(error => res.status(400).json({error: error}));
};


// Afficher + comptage des like/dislike
exports.likeSauce = (req, res, next) => {
  const userId = req.body.userId; // va trouver le User ID
  const like = req.body.like; // va trouver le like
  const sauceId = req.params.id; // va trouver le ID dans la requete 
  Sauce.findOne({ _id: sauceId })
  .then(sauce => { 
    // cas ou les valeurs sont à 0 
    const newValues = {
      usersLiked: sauce.usersLiked,
      usersDisliked: sauce.usersDisliked,
      likes: 0,
      dislikes: 0
    }
    // Différentes possibilités 
    switch (like) { // fonction switch qui permet l'evaluation de l'expression et en fonction du cas effectue les instructions par cas 
      case 1:  // cas ou la sauce à été likée 
      newValues.usersLiked.push(userId);
      break;
      case -1:  // cas ou la sauce à été dislike
      newValues.usersDisliked.push(userId);
      break;
      case 0:  // cas ou l'utilisateur supprime son like / dislike
      if (newValues.usersLiked.includes(userId)) {
        // cas ou annule le like
        const index = newValues.usersLiked.indexOf(userId);
        newValues.usersLiked.splice(index, 1);
      } else {
        // cas ou on annule le dislike
        const index = newValues.usersDisliked.indexOf(userId);
        newValues.usersDisliked.splice(index, 1);
      }
      break;
    };
    // Calcul du nombre de likes / dislikes
    newValues.likes = newValues.usersLiked.length;
    newValues.dislikes = newValues.usersDisliked.length;
    // Mise à jour de la sauce avec les nouvelles valeurs
    Sauce.updateOne({ _id: sauceId }, newValues )
    .then(() => res.status(200).json({ message: 'Sauce mise à jour !' }))
    .catch(error => res.status(400).json({ error }))  
  })
  .catch(error => res.status(500).json({ error }));
}