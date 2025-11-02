import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });

export const getMedicalSummary = async (reportText) => {
  console.log("ai response file", reportText);
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful medical assistant that summarizes reports and gives safe guidance.",
      },
      {
        role: "user",
        content: `Summarize this medical report and provide simple advice:\n${reportText}`,
      },
    ],
  });

  return response.choices[0].message.content;
};
