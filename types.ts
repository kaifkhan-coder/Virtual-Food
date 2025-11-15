
export type ImageStyle = 'Rustic/Dark' | 'Bright/Modern' | 'Social Media';

export interface DishImage {
  id: string;
  dishName: string;
  imageUrl: string;
  isLoading: boolean;
  isEditing: boolean;
  editPrompt: string;
  error?: string;
}

export interface ParsedDish {
    dishName: string;
}
