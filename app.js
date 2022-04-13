const mongoose = require('mongoose');
const express = require('express');
const userRoutes = require('./src/routes/user'); // chemin user
const sauceRoute = require('./src/routes/sauces'); // chemin pour les sauces 
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();



mongoose.connect(`${process.env.DB_LOGIN_ACCOUNT}`,
{ useNewUrlParser: true,
    useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      next();
  });


app.use(bodyParser.json()); // pour rendre cela exploitable 
app.use(express.json());


app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoute);
app.use('/images', express.static(path.join(__dirname, 'images')));




module.exports = app;