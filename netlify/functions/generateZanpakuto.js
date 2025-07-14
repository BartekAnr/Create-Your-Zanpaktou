import fetch from 'node-fetch';

export const handler = async (event) => {
  try {
    const inputData = JSON.parse(event.body);

    const prompt = `
Create a unique Zanpakutō based on these details:
Temperament: ${inputData.temperament}
Element: ${inputData.element}
Fighting Style: ${inputData.styl}
Emotions: ${inputData.emocje}
Message to the sword: ${inputData.przeslanie}
Additional: ${inputData.additional}

Return JSON with keys:
japaneseName, romajiName, translation, history, shikai, bankai, appearance, seireiteiRank, divisionDescription
`;

    const response = await fetch('https://api-inference.huggingface.co/models/openai-community/gpt2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 400, temperature: 0.8 },
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error('HuggingFace API error:', errorDetails);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch from AI API.' }),
      };
    }

    const data = await response.json();

    let generatedText = '';
    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      generatedText = data[0].generated_text;
    } else if (data.generated_text) {
      generatedText = data.generated_text;
    } else {
      generatedText = JSON.stringify(data);
    }

    // Upewnij się, że zwracasz wygenerowany tekst w formacie JSON (tekstowy string JSON)
    // jeśli model nie zwraca JSONa, to trzeba by go parsować lub odpowiednio formatować.

    return {
      statusCode: 200,
      body: JSON.stringify({ result: generatedText }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
