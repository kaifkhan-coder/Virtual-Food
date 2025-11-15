
import React from 'react';
import { ImageStyle } from '../types';
import { Sun, Moon, Instagram } from 'lucide-react';

interface StyleSelectorProps {
  selectedStyle: ImageStyle;
  onSelectStyle: (style: ImageStyle) => void;
}

const styles: { name: ImageStyle; icon: React.ReactNode; description: string }[] = [
  { name: 'Bright/Modern', icon: <Sun className="w-5 h-5" />, description: 'Clean, airy, and minimalist.' },
  { name: 'Rustic/Dark', icon: <Moon className="w-5 h-5" />, description: 'Moody, textured, and dramatic.' },
  { name: 'Social Media', icon: <Instagram className="w-5 h-5" />, description: 'Vibrant, top-down, and eye-catching.' },
];

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelectStyle }) => {
  return (
    <div className="grid grid-cols-1 gap-3">
      {styles.map(({ name, icon, description }) => (
        <button
          key={name}
          onClick={() => onSelectStyle(name)}
          className={`
            p-3 rounded-lg border-2 text-left transition-all duration-200
            flex items-start gap-3
            ${selectedStyle === name
              ? 'bg-indigo-500/20 border-indigo-500 shadow-lg shadow-indigo-500/10'
              : 'bg-gray-800/50 border-gray-700 hover:border-indigo-600 hover:bg-gray-800'
            }
          `}
        >
          <div className={`mt-1 ${selectedStyle === name ? 'text-indigo-400' : 'text-gray-400'}`}>{icon}</div>
          <div>
            <span className={`font-semibold ${selectedStyle === name ? 'text-white' : 'text-gray-300'}`}>{name}</span>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default StyleSelector;
