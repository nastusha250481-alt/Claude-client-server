require('dotenv').config();
const fetch = require('node-fetch');

module.exports.handler = async (event) => {
  const requestBody = JSON.parse(event.body);
  const userMessage = requestBody.request.original_utterance;

  if (!userMessage) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        version: requestBody.version,
        session: requestBody.session,
        response: {
          text: 'Привет! Что хочешь спросить у Claude?',
          end_session: false,
        },
      }),
    };
  }

  try {
    const claudeResponse = await fetch('https://api.vsegpt.ru/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CLAUDE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    const data = await claudeResponse.json();

    if (data.error) {
      throw new Error(JSON.stringify(data.error));
    }

    const claudeMessage = data.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({
        version: requestBody.version,
        session: requestBody.session,
        response: {
          text: claudeMessage,
          end_session: false,
        },
      }),
    };
  } catch (err) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        version: requestBody.version,
        session: requestBody.session,
        response: {
          text: 'Произошла ошибка при связи с ассистентом. Попробуйте позже.',
          end_session: true,
        },
      }),
    };
  }
};