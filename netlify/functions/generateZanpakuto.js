exports.handler = async function(event) {
  try {
    const inputData = JSON.parse(event.body);

    // Przykład: składamy prompt na podstawie inputData - możesz dostosować według własnych potrzeb
    const prompt = `
Create a unique Zanpakutō based on these details:
Temperament: ${inputData.temperament}
Element: ${inputData.element}
Fighting Style: ${inputData.styl}
Emotions: ${inputData.emocje}
Message to the sword: ${inputData.przeslanie}
Additional: ${inputData.additional}

Return JSON with keys:
japaneseName, romajiName, translation, history, shikai, bankai, appearance, seireiteiRank
`;

    // Wywołanie API HuggingFace - podmień 'your-model' na wybrany model
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

    // Przykładowo: GPT2 zwraca tekst w data[0].generated_text albo data.generated_text (zależnie od modelu)
    // Tu musisz dopasować do formatu zwracanego przez wybrany model
    let generatedText = '';
    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      generatedText = data[0].generated_text;
    } else if (data.generated_text) {
      generatedText = data.generated_text;
    } else {
      generatedText = JSON.stringify(data);
    }

    // Zakładamy, że zwracany tekst jest w formacie JSON - jeśli nie, trzeba zrobić parsowanie i ekstrakcję
    // Możesz dodać tutaj parser JSON lub inny kod, który przetworzy wygenerowany tekst na obiekt JS

    // Dla uproszczenia zwrócimy teraz tekst raw:
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
