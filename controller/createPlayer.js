const jwt = require('jsonwebtoken'); 
const Player = require('../models/player'); 
const Question = require('../models/questions') 
 
// Secret key for JWT 
const secretKey = 'your_secret_key'; 
 
// Fetch questions 
exports.getTopPlayers = async (req, res) => { 
  try { 
    const topPlayers1 = await Player.find({
      'result.q1': true,
      'result.q2': true,
      'result.q3': true,
    }).sort({'result.duration':1}).limit(5);

    const topPlayers2 = await Player.find({
      $or: [
        { 'result.q1': true, 'result.q2': true, 'result.q3': false },
        { 'result.q1': true, 'result.q2': false, 'result.q3': true },
        { 'result.q1': false, 'result.q2': true, 'result.q3': true },
      ],
    }).sort({'result.duration':1}).limit(5);

    res.status(200).json({top1:topPlayers1, top2:topPlayers2});
  }catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
}; 
 
// Start the game 
exports.startGame = async (req, res) => { 
  try { 
    const { email } = req.body; 

    if(await Player.findOne({email:email}) ){
          const BearerToken = req.headers['authorization'];
          const token = BearerToken.slice(7);
          if (!token) { 
              return res.status(401).json({ message: 'Unauthorized' }); 
          } 
          try{ 
              const decoded = jwt.verify(token, secretKey); 
              req.playerId = decoded.playerId; 
              return res.status(200).json({message:"Player exists"});
          }catch (err) { 
              return res.status(403).json({ message: 'Invalid token' }); 
          } 
    }

    const player = await Player.create({ email, startTime: new Date() }); 
 
    // Create JWT token 
    const token = jwt.sign({ playerId: player._id }, secretKey, { expiresIn: '12m' }); // Expires in 10 minutes 
 
    res.cookie('jwt_token', token, { httpOnly: true }); 
    res.status(201).json({ playerId: player._id, message:'Candidate Registered!', token:token}); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
};
 
// Manually submit answers 
exports.submitAnswers = async (req, res) => { 
  try { 
    const playerId = req.playerId; 
    const { questionId , playerAnswer, time } = req.body;
 
    // Get questions to check against answers 
    const question = await Question.findOne({question:questionId}); 
    if (!question) { 
      return res.status(404).json({ error: 'Question not found' }); 
    } 
 
    // Check if the player's answer matches the correct answer sequence 
    const isCorrect = (playerAnswer === question.answer);


    // Update player's answers and store correctness 
    const player = await Player.findById(playerId); 
    if (!player) { 
      return res.status(404).json({ error: 'Player not found' }); 
    } 

    let timeTaken = 180 - time;

    player.sequenceAnswers.push({
      questionId,
      correctAnswer:question.answer,
      playerAnswer,
      isCorrect,
      timeTaken
    }); 

    if(questionId==="3"){
      player.result.push({
        q1:player.sequenceAnswers[0].isCorrect,
        q2:player.sequenceAnswers[1].isCorrect,
        q3:player.sequenceAnswers[2].isCorrect,
        duration:player.sequenceAnswers[0].timeTaken + player.sequenceAnswers[1].timeTaken + player.sequenceAnswers[2].timeTaken
      })
    }
    await player.save();
 
    res.json({ message: 'Answers submitted successfully' }); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
};