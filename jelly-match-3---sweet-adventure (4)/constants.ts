
import { FruitType, LevelConfig } from './types';

export const GRID_SIZE = 6;

export const ASSET_BASE_PATH = './assets/images/';

export const FRUIT_ASSETS: Record<FruitType, string> = {
  strawberry: 'strawberry.png',
  lemon: 'lemon.png',
  grape: 'grape.png',
  watermelon: 'watermelon.png',
  blueberry: 'blueberry.png',
  orange: 'orange.png'
};

export const FRUIT_EMOJIS: Record<FruitType, string> = {
  strawberry: '🍓',
  lemon: '🍋',
  grape: '🍇',
  watermelon: '🍉',
  blueberry: '🫐',
  orange: '🍊'
};

export const FRUIT_COLORS: Record<FruitType, string> = {
  strawberry: 'bg-red-100',
  lemon: 'bg-yellow-100',
  grape: 'bg-purple-100',
  watermelon: 'bg-green-100',
  blueberry: 'bg-blue-100',
  orange: 'bg-orange-100'
};

export const LEVELS: LevelConfig[] = [
  { id: 1, targetScore: 300, maxMoves: 20, fruitPool: ['strawberry', 'lemon', 'grape'] },
  { id: 2, targetScore: 600, maxMoves: 25, fruitPool: ['strawberry', 'lemon', 'grape', 'watermelon'] },
  { id: 3, targetScore: 1000, maxMoves: 22, fruitPool: ['strawberry', 'lemon', 'grape', 'watermelon'] },
  { id: 4, targetScore: 1500, maxMoves: 20, fruitPool: ['strawberry', 'lemon', 'watermelon', 'blueberry'] },
  { id: 5, targetScore: 2000, maxMoves: 25, fruitPool: ['strawberry', 'lemon', 'grape', 'watermelon', 'blueberry', 'orange'] },
  { id: 6, targetScore: 3500, maxMoves: 25, fruitPool: ['strawberry', 'lemon', 'grape', 'watermelon', 'blueberry', 'orange'] },
];
