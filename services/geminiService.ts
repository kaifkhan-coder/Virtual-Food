
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ImageStyle, ParsedDish } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const menuParseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        dishName: {
          type: Type.STRING,
          description: 'The name of the dish.',
        },
      },
      required: ['dishName'],
    },
};

export const parseMenu = async (menuText: string): Promise<ParsedDish[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Parse the following restaurant menu text and extract only the dish names. Ignore prices, descriptions, and categories. Here is the menu:\n\n${menuText}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: menuParseSchema,
            },
        });

        const jsonStr = response.text.trim();
        const parsedResult = JSON.parse(jsonStr);
        
        // Ensure it's an array of objects with dishName
        if (Array.isArray(parsedResult) && parsedResult.every(item => typeof item.dishName === 'string')) {
            return parsedResult as ParsedDish[];
        } else {
            throw new Error("Parsed menu is not in the expected format.");
        }
    } catch (error) {
        console.error("Error parsing menu with Gemini:", error);
        // Fallback to simple line-by-line parsing
        return menuText.split('\n').filter(line => line.trim() !== '').map(line => ({ dishName: line.trim() }));
    }
};

const getStylePrompt = (style: ImageStyle, dishName: string): string => {
    const basePrompt = `Professional, ultra-realistic, high-end food photography of "${dishName}". Studio quality, DSLR, sharp focus, mouth-watering details.`;

    switch (style) {
        case 'Rustic/Dark':
            return `${basePrompt} Dark, moody lighting with rustic elements like a wooden table, dark linen, and vintage cutlery. Dramatic shadows, rich textures.`;
        case 'Bright/Modern':
            return `${basePrompt} Clean, modern, minimalist setting with bright, airy, natural light. White or light-colored background, simple plating, contemporary tableware. High key lighting, vibrant colors.`;
        case 'Social Media':
            return `Eye-catching, top-down flat lay food photography of "${dishName}", perfect for social media. Vibrant colors, interesting composition with complementary props like fresh ingredients or utensils. Bright, even lighting. Styled for Instagram.`;
        default:
            return basePrompt;
    }
};

export const generateFoodPhoto = async (dishName: string, style: ImageStyle): Promise<string> => {
    const prompt = getStylePrompt(style, dishName);

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '4:3',
        },
    });
    
    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("Image generation failed, no images returned.");
    }

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("Image generation failed, no images returned.");
    }

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

const base64ToInlineData = (base64String: string) => {
    const [header, data] = base64String.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
    return {
        inlineData: {
            data: data,
            mimeType: mimeType,
        },
    };
};

export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
    const imagePart = base64ToInlineData(base64Image);
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [imagePart, textPart],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        return `data:${mimeType};base64,${base64ImageBytes}`;
      }
    }

    throw new Error("Image editing failed, no image data returned.");
};
