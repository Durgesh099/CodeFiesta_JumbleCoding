const express = require('express');
const router = express.Router();
const gameController = require('../controller/createPlayer');
const jwt = require('jsonwebtoken');

const secretKey='your_secret_key';

// Middleware to verify JWT token 
const verifyToken = (req, res, next) => { 
    const BearerToken = req.headers['authorization'];
    const token = BearerToken.slice(7);
    if (!token) { 
        return res.status(401).json({ message: 'Unauthorized' }); 
    } 
    try{ 
        const decoded = jwt.verify(token, secretKey); 
        req.playerId = decoded.playerId; 
        next(); 
    }catch (err) { 
        return res.status(403).json({ message: 'Invalid token' }); 
    } 
};

router.get('/top-players',gameController.getTopPlayers);
router.post('/submit-answers',verifyToken,gameController.submitAnswers)
router.post('/start-game',gameController.startGame);


module.exports = router;