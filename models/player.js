const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        },
    sequenceAnswers: [{ 
        questionId: { 
            type: String, 
            ref: 'Question', 
            required: true 
        }, 
        correctAnswer: { 
            type: String, 
            required: true 
        }, 
        playerAnswer: { 
            type: String, 
            required: true 
        }, 
        isCorrect: { 
            type: Boolean
        },
        timeTaken: {
            type: Number,
            required: true,
            default: null
        }
    }],
    result:[{
        q1:{
            type: Boolean
        },
        q2:{
            type: Boolean
        },
        q3:{
            type: Boolean
        },
        duration: {
            type: Number
        }
    }],
    progress:{
        type:Number,
        default:0,
    }
    });

module.exports = mongoose.model("Player", PlayerSchema);