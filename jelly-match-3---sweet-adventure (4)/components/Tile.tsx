
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TileData } from '../types';
import { FRUIT_EMOJIS, FRUIT_ASSETS, ASSET_BASE_PATH } from '../constants';

interface TileProps {
  tile: TileData;
  isSelected: boolean;
  isHinted: boolean;
  onClick: () => void;
}

const Tile: React.FC<TileProps> = ({ tile, isSelected, isHinted, onClick }) => {
  const [imgError, setImgError] = useState(false);
  // 核心：优先尝试读取本地资源路径
  const imgSrc = `${ASSET_BASE_PATH}${FRUIT_ASSETS[tile.type]}`;

  return (
    <motion.div
      layout
      onClick={onClick}
      className="relative w-full h-full p-1 cursor-pointer"
      initial={{ scale: 0, y: -50 }}
      animate={{ 
        scale: tile.isMatching ? 0 : isHinted ? [1, 1.1, 1] : 1,
        y: 0,
        zIndex: isSelected || isHinted ? 50 : 10
      }}
      transition={{ 
        type: 'spring', stiffness: 400, damping: 15,
        scale: isHinted ? { repeat: Infinity, duration: 1 } : {}
      }}
    >
      {/* 瓷砖底座：参考图中的米色圆角背景 */}
      <div 
        className={`w-full h-full flex items-center justify-center rounded-2xl relative transition-all duration-300 ${
          isSelected ? 'ring-4 ring-yellow-400 scale-105' : 
          isHinted ? 'ring-4 ring-white' : ''
        }`}
        style={{
          background: '#FFF9E5', // 参考图瓷砖底色
          boxShadow: isSelected 
            ? '0 10px 20px rgba(0,0,0,0.2), inset 0 -6px 0 rgba(0,0,0,0.1)' 
            : '0 4px 0 rgba(0,0,0,0.05), inset 0 -4px 0 rgba(0,0,0,0.1)',
        }}
      >
        {/* 玻璃质感高光 */}
        <div className="absolute top-1 left-2 right-2 h-1/3 bg-white/40 rounded-full blur-[1px] pointer-events-none z-20" />

        {/* 优先加载本地图片，失败则回退至 Emoji */}
        {!imgError ? (
          <img 
            src={imgSrc} 
            alt={tile.type}
            className="w-[80%] h-[80%] object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] brightness-105 select-none pointer-events-none z-10"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-4xl md:text-5xl pointer-events-none select-none drop-shadow-md z-10">
            {FRUIT_EMOJIS[tile.type]}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default Tile;
