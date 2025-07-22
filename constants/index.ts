export const AIResponseFormat = `
    interface Feedback {
    overallScore: number; //max 100
    ATS: {
      score: number; //rate based on ATS suitability
      tips: {
        type: "good" | "improve";
        tip: string; //give 3-4 tips
      }[];
    };
    toneAndStyle: {
      score: number; //max 100
      tips: {
        type: "good" | "improve";
        tip: string; //make it a short "title" for the actual explanation
        explanation: string; //explain in detail here
      }[]; //give 3-4 tips
    };
    content: {
      score: number; //max 100
      tips: {
        type: "good" | "improve";
        tip: string; //make it a short "title" for the actual explanation
        explanation: string; //explain in detail here
      }[]; //give 3-4 tips
    };
    structure: {
      score: number; //max 100
      tips: {
        type: "good" | "improve";
        tip: string; //make it a short "title" for the actual explanation
        explanation: string; //explain in detail here
      }[]; //give 3-4 tips
    };
    skills: {
      score: number; //max 100
      tips: {
        type: "good" | "improve";
        tip: string; //make it a short "title" for the actual explanation
        explanation: string; //explain in detail here
      }[]; //give 3-4 tips
    };
  }`;

export const preparePrompt = ({
  jobTitle,
  jobDescription,
}: {
  jobTitle: string;
  jobDescription: string;
}) =>
  `You are an expert in resume analysis and Applicant Tracking Systems (ATS).
Your task is to thoroughly review and evaluate the provided resume for a job application.

**Instructions:**
- Assess the resume for overall quality, clarity, and professionalism.
- Evaluate how well the resume matches the job title and job description provided.
- Check for ATS compatibility: keyword usage, formatting, and structure.
- Identify strengths and highlight what the candidate is doing well.
- Point out weaknesses, mistakes, or areas for improvement, including missing information, unclear sections, or poor formatting.
- Consider modern resume best practices, including concise language, quantifiable achievements, and relevant skills.
- If the job description is provided, tailor your feedback to the specific requirements and preferences of the role.
- Be honest and constructive. Give low scores if there are significant issues, but always provide actionable suggestions for improvement.
- If you notice spelling, grammar, or language issues, mention them specifically.

**Scoring:**
- Use a 0-100 scale for each category.
- Justify each score with a brief explanation.

**Output:**
- Provide your feedback in the following JSON format (no extra text, no backticks):

${AIResponseFormat}

Return only the JSON object as your response. Do not include any other text, comments, or formatting.`;
