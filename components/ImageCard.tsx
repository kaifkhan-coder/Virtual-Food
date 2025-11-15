
import React from 'react';
import { DishImage } from '../types';
import { Edit, Send } from 'lucide-react';

interface ImageCardProps {
  dish: DishImage;
  onEdit: (id: string, originalImageUrl: string, prompt: string) => void;
  onPromptChange: (id: string, prompt: string) => void;
}

const SkeletonLoader: React.FC = () => (
    <div className="bg-gray-700 animate-pulse rounded-lg p-4 space-y-3">
        <div className="h-48 bg-gray-600 rounded"></div>
        <div className="h-6 w-3/4 bg-gray-600 rounded"></div>
        <div className="h-10 bg-gray-600 rounded"></div>
    </div>
);

const ImageCard: React.FC<ImageCardProps> = ({ dish, onEdit, onPromptChange }) => {
  if (dish.isLoading) {
    return <SkeletonLoader />;
  }

  const handleEditClick = () => {
    if (dish.editPrompt && dish.imageUrl) {
      onEdit(dish.id, dish.imageUrl, dish.editPrompt);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 flex flex-col">
      <div className="relative">
        <img src={dish.imageUrl} alt={dish.dishName} className="w-full h-48 object-cover" />
        {dish.isEditing && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        )}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-semibold text-lg text-white mb-2 flex-grow">{dish.dishName}</h3>
        {dish.error && <p className="text-xs text-red-400 mb-2">{dish.error}</p>}
        <div className="mt-auto">
            <label htmlFor={`edit-prompt-${dish.id}`} className="text-xs text-gray-400 flex items-center gap-1 mb-1"><Edit size={12}/>Edit Image</label>
            <div className="flex items-center gap-2">
                <input
                    id={`edit-prompt-${dish.id}`}
                    type="text"
                    value={dish.editPrompt}
                    onChange={(e) => onPromptChange(dish.id, e.target.value)}
                    placeholder="e.g., add steam, change plate..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-1.5 px-3 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    disabled={dish.isEditing}
                />
                <button
                    onClick={handleEditClick}
                    disabled={!dish.editPrompt || dish.isEditing}
                    className="p-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
