import { GoogleGenAI } from "@google/genai";
import { Employee, ImageSize, AspectRatio, VideoAspectRatio } from "../types";

// Always create a new instance when needed to ensure fresh keys if they change (e.g. for Veo)
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePerformanceReview = async (employee: Employee): Promise<string> => {
  const prompt = `
    You are an expert HR assistant. 
    Write a professional performance review draft for the following employee.
    
    Name: ${employee.firstName} ${employee.lastName}
    Position: ${employee.position}
    Department: ${employee.department}
    Status: ${employee.status}
    Hire Date: ${employee.hireDate}
    Key Notes: ${employee.performanceNotes || 'No specific notes provided.'}

    The review should be balanced, encouraging, and professional. 
    Structure it with:
    1. Summary
    2. Strengths
    3. Areas for Growth
    4. Goal Setting
    
    Keep it under 300 words.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate review.";
  } catch (error) {
    console.error("API Error:", error);
    return "Error generating content. Please check your system configuration.";
  }
};

export const analyzeDepartmentHealth = async (employees: Employee[], department: string): Promise<string> => {
  const deptEmployees = employees.filter(e => e.department === department);
  const dataSummary = JSON.stringify(deptEmployees.map(e => ({
    role: e.position,
    salary: e.salary,
    status: e.status
  })));

  const prompt = `
    Analyze the following anonymized data for the ${department} department:
    ${dataSummary}

    Provide a brief strategic insight regarding:
    1. Team composition balance.
    2. Potential risks (e.g., turnover if many are on leave/probation).
    3. Salary distribution fairness (general observation).
    
    Keep it concise and actionable for an executive.
  `;

  try {
     const ai = getAI();
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("API Error:", error);
    return "Error analyzing data.";
  }
};

// --- New Media Features ---

export const generateImage = async (prompt: string, size: ImageSize, aspectRatio: AspectRatio): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: aspectRatio
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

export const editImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    // Strip data url prefix if present
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
};

export const analyzeImage = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }, // Assuming JPEG for uploads usually, generic mime handling would be better but simple here
          { text: prompt || "Analyze this image." }
        ]
      }
    });
    return response.text || "No analysis returned.";
  } catch (error) {
    console.error("Analysis Error:", error);
    return "Failed to analyze image.";
  }
};

export const generateVideo = async (prompt: string, aspectRatio: VideoAspectRatio, imageBase64?: string): Promise<string | null> => {
  const ai = getAI(); // Crucial: gets new instance which might have updated key from aistudio flow
  
  const config: any = {
    numberOfVideos: 1,
    resolution: '720p',
    aspectRatio: aspectRatio,
  };

  let model = 'veo-3.1-fast-generate-preview';
  
  // Prepare contents
  const videoParams: any = {
      model,
      prompt,
      config
  };

  if (imageBase64) {
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
    videoParams.image = {
        imageBytes: cleanBase64,
        mimeType: 'image/png' // Assuming PNG/JPEG common
    };
  }

  try {
    let operation = await ai.models.generateVideos(videoParams);

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (uri) {
      return `${uri}&key=${process.env.API_KEY}`;
    }
    return null;
  } catch (error) {
    console.error("Video Gen Error:", error);
    throw error;
  }
};