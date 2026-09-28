/**
 * GroundFix AI Assistant Controller (Rule 31)
 */

const { answerQuestion } = require('../services/aiService');

async function askAssistant(req, res, next) {
  try {
    const { message, language } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message content cannot be empty.'
      });
    }

    const response = await answerQuestion(message, language || 'en');

    res.json({
      success: true,
      data: response
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  askAssistant
};
