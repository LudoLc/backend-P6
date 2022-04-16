const express = require('express');
const sauce = require('../controllers/sauce');
//Import du middleware auth pour sécuriser les routes
const auth = require('../middlewares/auth');
//Import du middleware multer pour la gestion des images
const multer = require('../middlewares/multer');

const router = express.Router();


// CRUD
router.post('/', auth, multer, sauce.createSauce);
router.get('/', auth, sauce.getAllSauces);
router.get('/:id', auth, sauce.getOneSauce);
router.put('/:id', auth, multer, sauce.updateOneSauce)
router.delete('/:id', auth, multer, sauce.deleteSauce);
router.post('/:id/like', auth, sauce.likeSauce);



module.exports = router;