
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, TileData, GameStatus } from './types';
import { GRID_SIZE, LEVELS } from './constants';
import { audio } from './services/audioService';
import Tile from './components/Tile';
import GameOverlay from './components/GameOverlay';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    score: 0,
    moves: 0,
    level: 1,
    targetScore: 300,
    status: 'start'
  });
  const [isMuted, setIsMuted] = useState(false);
  const [selectedTile, setSelectedTile] = useState<TileData | null>(null);
  const [hintTiles, setHintTiles] = useState<string[]>([]);
  const isProcessing = useRef(false);

  useEffect(() => {
    if (gameState.grid.length === 0) {
      initLevel(1);
    }
  }, []);

  const findMatches = (grid: TileData[][]) => {
    const matches = new Set<string>();
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 2; c++) {
        if (grid[r][c].type === grid[r][c+1].type && grid[r][c+1].type === grid[r][c+2].type) {
          matches.add(`${r},${c}`); matches.add(`${r},${c+1}`); matches.add(`${r},${c+2}`);
        }
      }
    }
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE - 2; r++) {
        if (grid[r][c].type === grid[r+1][c].type && grid[r+1][c].type === grid[r+2][c].type) {
          matches.add(`${r},${c}`); matches.add(`${r+1},${c}`); matches.add(`${r+2},${c}`);
        }
      }
    }
    return Array.from(matches).map(s => s.split(',').map(Number));
  };

  const hasPossibleMoves = (grid: TileData[][]) => {
    const temp = grid.map(row => row.map(t => ({ ...t })));
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (c < GRID_SIZE - 1) {
          [temp[r][c].type, temp[r][c+1].type] = [temp[r][c+1].type, temp[r][c].type];
          if (findMatches(temp).length > 0) return true;
          [temp[r][c].type, temp[r][c+1].type] = [temp[r][c+1].type, temp[r][c].type];
        }
        if (r < GRID_SIZE - 1) {
          [temp[r][c].type, temp[r+1][c].type] = [temp[r+1][c].type, temp[r][c].type];
          if (findMatches(temp).length > 0) return true;
          [temp[r][c].type, temp[r+1][c].type] = [temp[r+1][c].type, temp[r][c].type];
        }
      }
    }
    return false;
  };

  const findHint = (grid: TileData[][]): string[] | null => {
    const temp = grid.map(row => row.map(t => ({ ...t })));
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (c < GRID_SIZE - 1) {
          [temp[r][c].type, temp[r][c+1].type] = [temp[r][c+1].type, temp[r][c].type];
          if (findMatches(temp).length > 0) return [grid[r][c].id, grid[r][c+1].id];
          [temp[r][c].type, temp[r][c+1].type] = [temp[r][c+1].type, temp[r][c].type];
        }
        if (r < GRID_SIZE - 1) {
          [temp[r][c].type, temp[r+1][c].type] = [temp[r+1][c].type, temp[r][c].type];
          if (findMatches(temp).length > 0) return [grid[r][c].id, grid[r+1][c].id];
          [temp[r][c].type, temp[r+1][c].type] = [temp[r+1][c].type, temp[r][c].type];
        }
      }
    }
    return null;
  };

  const initLevel = (levelNum: number) => {
    const config = LEVELS.find(l => l.id === levelNum) || LEVELS[0];
    let newGrid: TileData[][] = [];
    let valid = false;
    while (!valid) {
      newGrid = Array.from({ length: GRID_SIZE }, (_, r) => 
        Array.from({ length: GRID_SIZE }, (_, c) => ({
          id: `t-${r}-${c}-${Math.random()}`,
          type: config.fruitPool[Math.floor(Math.random() * config.fruitPool.length)],
          row: r, col: c
        }))
      );
      if (findMatches(newGrid).length === 0 && hasPossibleMoves(newGrid)) valid = true;
    }
    setGameState({
      grid: newGrid, score: 0, moves: config.maxMoves, level: config.id, targetScore: config.targetScore, status: 'playing'
    });
    setHintTiles([]);
    isProcessing.current = false;
  };

  const processBoard = async (grid: TileData[][]) => {
    let currentGrid = [...grid.map(r => [...r])];
    let matches = findMatches(currentGrid);
    
    while (matches.length > 0) {
      audio.play('match');
      matches.forEach(([r, c]) => { currentGrid[r][c].isMatching = true; });
      setGameState(prev => ({ ...prev, grid: [...currentGrid], score: prev.score + matches.length * 20, status: 'animating' }));
      
      await new Promise(r => setTimeout(r, 400));
      
      const nextGrid: TileData[][] = Array.from({ length: GRID_SIZE }, () => []);
      const fruitPool = LEVELS.find(l => l.id === gameState.level)?.fruitPool || LEVELS[0].fruitPool;
      
      for (let c = 0; c < GRID_SIZE; c++) {
        const col: TileData[] = [];
        for (let r = GRID_SIZE - 1; r >= 0; r--) if (!currentGrid[r][c].isMatching) col.unshift(currentGrid[r][c]);
        while (col.length < GRID_SIZE) col.unshift({ id: `drop-${Math.random()}`, type: fruitPool[Math.floor(Math.random() * fruitPool.length)], row: 0, col: c });
        col.forEach((t, r) => { nextGrid[r][c] = { ...t, row: r, col: c, isMatching: false }; });
      }
      currentGrid = nextGrid;
      setGameState(prev => ({ ...prev, grid: currentGrid }));
      await new Promise(r => setTimeout(r, 500));
      matches = findMatches(currentGrid);
    }

    isProcessing.current = false;
    setGameState(prev => {
      const win = prev.score >= prev.targetScore;
      if (win) audio.play('win');
      return { ...prev, status: win ? 'level-complete' : prev.moves <= 0 ? 'game-over' : 'playing' as GameStatus };
    });
  };

  const handleTileClick = async (tile: TileData) => {
    if (gameState.status !== 'playing' || isProcessing.current) return;
    setHintTiles([]);
    audio.play('click');
    
    if (!selectedTile) {
      setSelectedTile(tile);
    } else {
      const dist = Math.abs(selectedTile.row - tile.row) + Math.abs(selectedTile.col - tile.col);
      if (dist === 1) {
        isProcessing.current = true;
        audio.play('swap');
        const original = [...gameState.grid.map(r => [...r])];
        const next = [...gameState.grid.map(r => [...r])];
        next[tile.row][tile.col] = { ...selectedTile, row: tile.row, col: tile.col };
        next[selectedTile.row][selectedTile.col] = { ...tile, row: selectedTile.row, col: selectedTile.col };
        
        setGameState(prev => ({ ...prev, grid: next, moves: prev.moves - 1 }));
        setSelectedTile(null);
        
        await new Promise(r => setTimeout(r, 300));
        if (findMatches(next).length > 0) processBoard(next);
        else { 
          audio.play('error'); 
          setGameState(prev => ({ ...prev, grid: original })); 
          isProcessing.current = false; 
        }
      } else {
        setSelectedTile(tile);
      }
    }
  };

  return (
    <div className="flex flex-col items-center h-screen w-full relative overflow-hidden bg-gradient-to-b from-[#87D9FF] via-[#BFEAFF] to-[#E3F6FF]">
      {/* 动态背景云朵 */}
      <div className="absolute top-[10%] left-[-5%] w-48 opacity-40 floating text-8xl pointer-events-none">☁️</div>
      <div className="absolute top-[25%] right-[-8%] w-40 opacity-30 floating text-7xl pointer-events-none" style={{ animationDelay: '2s' }}>☁️</div>
      <div className="absolute bottom-[20%] left-[-2%] w-32 opacity-20 floating text-6xl pointer-events-none" style={{ animationDelay: '1s' }}>☁️</div>

      {/* --- 顶部 HUD (参考图布局) --- */}
      <div className="w-full max-w-4xl flex items-center justify-between px-6 pt-10 pb-4 z-20">
        {/* 左侧生命值 */}
        <div className="bg-white rounded-full px-5 py-2 flex items-center gap-1 shadow-[0_4px_0_rgba(142,222,255,1)] border-[3px] border-[#8EDEFF]">
          {[...Array(3)].map((_, i) => (
            <motion.i 
              key={i} 
              animate={{ scale: [1, 1.1, 1] }} 
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
              className="fas fa-heart text-[#FF4D4D] text-2xl drop-shadow-sm"
            ></motion.i>
          ))}
        </div>

        {/* 中间得分 */}
        <div className="flex-1 flex justify-center px-4">
          <div className="bg-gradient-to-b from-[#4EB8FF] to-[#1B89E0] rounded-full border-[5px] border-white shadow-[0_8px_15px_rgba(0,0,0,0.2)] px-12 py-3 flex items-center justify-center gap-3 min-w-[240px] relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 skew-x-[-20deg] translate-x-1/2 pointer-events-none" />
            <span className="game-font text-white text-5xl tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {String(gameState.score).padStart(4, '0')}
            </span>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
              <i className="fas fa-star text-[#FFD700] text-4xl drop-shadow-md"></i>
            </motion.div>
          </div>
        </div>

        {/* 右侧设置 */}
        <button className="w-16 h-16 bg-gradient-to-b from-[#B0C4D1] to-[#7D93A1] rounded-full border-[5px] border-white shadow-lg flex items-center justify-center active:scale-95 transition-transform group">
          <i className="fas fa-cog text-white text-3xl group-hover:rotate-90 transition-transform duration-500"></i>
        </button>
      </div>

      {/* --- 游戏主区域 (参考图粉色边框) --- */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 z-10">
        <motion.div 
          className="relative bg-[#FF85B2] p-5 rounded-[48px] shadow-[0_20px_0_#D15F8A,0_25px_50px_rgba(0,0,0,0.3)] border-[10px] border-[#FFBBD4]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {/* 内部凹陷效果区域 */}
          <div className="bg-[#FF99C8]/40 rounded-[38px] p-2 shadow-[inset_0_10px_20px_rgba(0,0,0,0.2)]">
            <div className="grid grid-cols-6 gap-2 w-[340px] h-[340px] md:w-[540px] md:h-[540px]">
              {gameState.grid.flat().map((t) => (
                <Tile 
                  key={t.id} 
                  tile={t} 
                  isSelected={selectedTile?.id === t.id} 
                  isHinted={hintTiles.includes(t.id)} 
                  onClick={() => handleTileClick(t)} 
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- 底部控制栏 (参考图样式) --- */}
      <div className="w-full max-w-5xl flex justify-center items-center gap-6 px-6 pb-16 z-20">
        {/* 重新开始 (绿色) */}
        <button 
          onClick={() => { audio.play('click'); initLevel(gameState.level); }}
          className="flex-1 max-w-[240px] bg-gradient-to-b from-[#A4E341] to-[#76B935] text-white rounded-full py-5 shadow-[0_8px_0_#5D932A] border-[5px] border-white flex items-center justify-center gap-3 active:translate-y-2 active:shadow-none transition-all"
        >
          <div className="bg-white/40 rounded-full w-10 h-10 flex items-center justify-center shadow-inner">
            <i className="fas fa-undo text-white text-xl"></i>
          </div>
          <span className="game-font text-2xl whitespace-nowrap drop-shadow-sm">重新开始</span>
        </button>

        {/* 提示 (粉色) */}
        <button 
          onClick={() => { audio.play('hint'); const hint = findHint(gameState.grid); setHintTiles(hint || []); }}
          className="flex-1 max-w-[240px] bg-gradient-to-b from-[#FF87C3] to-[#E35F9F] text-white rounded-full py-5 shadow-[0_8px_0_#B33F78] border-[5px] border-white flex items-center justify-center gap-3 active:translate-y-2 active:shadow-none transition-all"
        >
          <div className="bg-white/40 rounded-full w-10 h-10 flex items-center justify-center shadow-inner">
            <i className="fas fa-question text-white text-2xl"></i>
          </div>
          <span className="game-font text-2xl whitespace-nowrap drop-shadow-sm">提 示</span>
        </button>

        {/* 暂停 (蓝色) */}
        <button 
          onClick={() => { audio.play('click'); setGameState(p => ({...p, status: 'paused'})); }}
          className="flex-1 max-w-[240px] bg-gradient-to-b from-[#4EB8FF] to-[#2B86E0] text-white rounded-full py-5 shadow-[0_8px_0_#1B62B3] border-[5px] border-white flex items-center justify-center gap-3 active:translate-y-2 active:shadow-none transition-all"
        >
          <span className="game-font text-2xl whitespace-nowrap drop-shadow-sm">暂 停</span>
          <div className="bg-white/40 rounded-full w-10 h-10 flex items-center justify-center shadow-inner">
            <i className="fas fa-pause text-white text-xl"></i>
          </div>
        </button>
      </div>

      <GameOverlay 
        status={gameState.status} 
        score={gameState.score} 
        level={gameState.level} 
        onAction={() => {
          if (gameState.status === 'level-complete') initLevel(gameState.level + 1);
          else if (gameState.status === 'paused') setGameState(p => ({...p, status: 'playing'}));
          else initLevel(gameState.level);
        }} 
      />
    </div>
  );
};

export default App;
