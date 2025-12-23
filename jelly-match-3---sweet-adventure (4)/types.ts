
export type FruitType = 'strawberry' | 'lemon' | 'grape' | 'watermelon' | 'blueberry' | 'orange';

export interface TileData {
  id: string;
  type: FruitType;
  row: number;
  col: number;
  isMatching?: boolean;
}

export type GameStatus = 'start' | 'playing' | 'animating' | 'level-complete' | 'game-over' | 'paused';

export interface LevelConfig {
  id: number;
  targetScore: number;
  maxMoves: number;
  fruitPool: FruitType[];
}

export interface GameState {
  grid: TileData[][];
  score: number;
  moves: number;
  level: number;
  targetScore: number;
  status: GameStatus;
}
