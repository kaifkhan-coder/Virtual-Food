
import React, { useState } from 'react';
import { generateImageFromPrompt } from '../services/geminiService';
import { Image as ImageIcon, WandSparkles } from 'lucide-react';

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const imageUrl = await generateImageFromPrompt(prompt);
            setGeneratedImage(imageUrl);
        } catch (e) {
            console.error(e);
            setError('Failed to generate image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-16 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl shadow-purple-900/20 border border-gray-700">
            <div className="flex items-center gap-4 mb-4">
                <div className="inline-flex items-center justify-center bg-purple-500/10 p-3 rounded-full">
                    <ImageIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Generate Image from Prompt</h2>
                    <p className="text-gray-400">Not inspired by your menu? Create any food image you can imagine.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A gourmet burger on a black slate plate"
                    className="w-full bg-gray-900/70 border border-gray-600 rounded-lg py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder-gray-500"
                    disabled={isLoading}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:scale-100 flex-shrink-0"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                        </>
                    ) : (
                        <>
                            <WandSparkles className="w-5 h-5" />
                            Generate
                        </>
                    )}
                </button>
            </div>

            {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
            
            <div className="w-full aspect-square bg-gray-900/50 rounded-lg border border-gray-700 flex items-center justify-center">
                {isLoading && (
                    <div className="flex flex-col items-center text-gray-500">
                        <ImageIcon className="w-16 h-16 animate-pulse" />
                        <p className="mt-2">Creating your masterpiece...</p>
                    </div>
                )}
                {!isLoading && generatedImage && (
                    <img src={generatedImage} alt={prompt} className="w-full h-full object-contain rounded-lg" />
                )}
                 {!isLoading && !generatedImage && (
                    <div className="text-gray-500 text-center">
                        <p>Your generated image will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageGenerator;
