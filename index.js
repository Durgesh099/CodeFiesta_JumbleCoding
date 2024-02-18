const express = require('express');
const app =express();
const mongoose = require('mongoose');
const bodyParser = require ('body-parser');
const cors = require('cors');

require("dotenv").config();
const PORT = process.env.PORT || 3000;

//middleware
app.use(cors())
app.use(bodyParser.json());
require("./config/database").connect()

const gameRoutes = require('./routes/game');
app.use('/api/',gameRoutes);

app.listen(PORT, () =>{
    console.log('Server is running at port');
});



