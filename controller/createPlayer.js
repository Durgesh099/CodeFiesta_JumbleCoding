const jwt = require('jsonwebtoken'); 
const Player = require('../models/player'); 
const Question = require('../models/questions') 
 
// Secret key for JWT 
const secretKey = 'your_secret_key'; 
 
// Fetch questions 
exports.getQuestions = async (req, res) => { 
  try { 
    const playerId = req.playerId; 
 
    // Fetch player record 
    const player = await Player.findById(playerId); 
    if (!player) { 
      return res.status(404).json({ error: 'Player not found' }); 
    } 
 
    // Get the progress index to fetch the next question 
    const progressIndex = player.progress; 
 
    // Fetch the next question 
    const question = await Question.findOne().skip(progressIndex).exec(); 
    if (!question) { 
      // No more questions, you can handle this case as needed 
      return res.json({ message: 'No more questions' }); 
    } 
 
    // Increment the progress index for the next request 
    player.progress += 1; 
    await player.save(); 
 
    res.json({ question }); 
  }catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
}; 
 
// Start the game 
exports.startGame = async (req, res) => { 
  try { 
    const { email } = req.body; 

    if(await Player.findOne({email:email}) ){
      return res.status(200).json({message:"Player exists"});
    }

    const player = await Player.create({ email, startTime: new Date() }); 
 
    // Create JWT token 
    const token = jwt.sign({ playerId: player._id }, secretKey, { expiresIn: '16m' }); // Expires in 16 minutes 
 
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

    let timeTaken = 120 - time;

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