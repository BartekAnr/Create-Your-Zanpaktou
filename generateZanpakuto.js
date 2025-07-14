const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const input = JSON.parse(event.body);

  const prompt = `
Create a unique Zanpakutō for a Shinigami in the Bleach universe.
Based on the following:
- Temperament: ${input.temperament}
- Element: ${input.element}
- Fighting Style: ${input.styl}
- Emotions: ${input.emocje}
- Message to sword: ${input.przeslanie}
- Additional Notes: ${input.additional}

Return:
1. Zanpakutō name (Japanese, Romaji, English)
2. Shinigami's backstory (italic, short)
3. Shikai: name, ability, appearance, and how it was obtained
4. Bankai: name, power, appearance, and how it was obtained
5. Blade and scabbard appearance
6. Assigned division and rank in Soul Society, with description and justification
  `;

  const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        temperature: 0.8,
        max_new_tokens: 1000,
        return_full_text: false,
      },
    }),
  });

  if (!response.ok) {
    return { statusCode: 500, body: "AI request failed." };
  }

  const result = await response.json();
  const output = result[0]?.generated_text || "No result returned.";

  return {
    statusCode: 200,
    body: JSON.stringify({ output }),
  };
};
