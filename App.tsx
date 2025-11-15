
import React, { useState, useCallback } from 'react';
import { ImageStyle, DishImage } from './types';
import { parseMenu, generateFoodPhoto, editImage } from './services/geminiService';
import StyleSelector from './components/StyleSelector';
import ImageCard from './components/ImageCard';
import { Camera, Edit, WandSparkles } from 'lucide-react';
import ImageGenerator from './components/ImageGenerator';

const App: React.FC = () => {
  const [menuText, setMenuText] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('Bright/Modern');
  const [dishImages, setDishImages] = useState<DishImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePhotos = useCallback(async () => {
    if (!menuText.trim()) {
      setError('Please enter a menu.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setDishImages([]);

    try {
      const parsedDishes = await parseMenu(menuText);
      const initialDishes = parsedDishes.map(dish => ({
        id: dish.dishName.replace(/\s+/g, '-').toLowerCase() + Date.now(),
        dishName: dish.dishName,
        imageUrl: '',
        isLoading: true,
        isEditing: false,
        editPrompt: '',
      }));
      setDishImages(initialDishes);

      const imagePromises = parsedDishes.map(dish => 
        generateFoodPhoto(dish.dishName, selectedStyle)
      );

      const results = await Promise.allSettled(imagePromises);

      setDishImages(prevDishes => {
        return prevDishes.map((dish, index) => {
          const result = results[index];
          if (result.status === 'fulfilled') {
            return { ...dish, imageUrl: result.value, isLoading: false };
          } else {
            console.error(`Failed to generate image for ${dish.dishName}:`, result.reason);
            return { ...dish, imageUrl: '', isLoading: false, error: 'Failed to generate image' };
          }
        });
      });

    } catch (e) {
      console.error(e);
      setError('Failed to parse menu or generate images. Please check your menu format and try again.');
      setDishImages([]);
    } finally {
      setIsLoading(false);
    }
  }, [menuText, selectedStyle]);

  const handleEditImage = useCallback(async (id: string, originalImageUrl: string, prompt: string) => {
    setDishImages(prev => prev.map(d => d.id === id ? { ...d, isEditing: true } : d));
    try {
      const editedImageUrl = await editImage(originalImageUrl, prompt);
      setDishImages(prev => prev.map(d => d.id === id ? { ...d, imageUrl: editedImageUrl, isEditing: false, editPrompt: '' } : d));
    } catch (e) {
      console.error(`Failed to edit image for dish ID ${id}:`, e);
      setDishImages(prev => prev.map(d => d.id === id ? { ...d, isEditing: false, error: 'Editing failed' } : d));
    }
  }, []);

  const handleEditPromptChange = (id: string, prompt: string) => {
    setDishImages(prev => prev.map(d => d.id === id ? { ...d, editPrompt: prompt } : d));
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
            <div className="inline-flex items-center justify-center bg-indigo-500/10 p-4 rounded-full mb-4">
                <Camera className="w-12 h-12 text-indigo-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                Virtual Food Photographer
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                Turn your menu into a stunning, professional photoshoot. Paste your menu, choose a style, and let AI create mouth-watering images for every dish.
            </p>
        </header>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl shadow-indigo-900/20 border border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div>
                <label htmlFor="menu-input" className="block text-sm font-medium text-gray-300 mb-2">1. Paste Your Menu</label>
                <textarea
                  id="menu-input"
                  rows={10}
                  className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-500"
                  placeholder="e.g.,&#10;Classic Margherita Pizza&#10;Spaghetti Carbonara&#10;Tiramisu"
                  value={menuText}
                  onChange={(e) => setMenuText(e.target.value)}
                />
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-300 mb-2">2. Choose a Style</h3>
                <StyleSelector selectedStyle={selectedStyle} onSelectStyle={setSelectedStyle} />
              </div>
              <button
                onClick={handleGeneratePhotos}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:scale-100"
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
                    Generate Photos
                  </>
                )}
              </button>
              {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
            </div>
            <div className="lg:col-span-2">
              <div className="h-full bg-gray-900/50 rounded-lg p-4 border border-gray-700 min-h-[300px] lg:min-h-0">
                {dishImages.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Camera className="w-16 h-16 mb-4" />
                    <p className="text-center">Your generated food photos will appear here.</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
                  {dishImages.map((dish) => (
                    <ImageCard 
                      key={dish.id} 
                      dish={dish} 
                      onEdit={handleEditImage} 
                      onPromptChange={handleEditPromptChange} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <ImageGenerator />

      </main>
    </div>
  );
};

export default App;
