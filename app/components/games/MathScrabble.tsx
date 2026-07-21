// components/games/MathScrabble.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';

interface MathScrabbleProps {
  onComplete: (stars: number, extra?: any) => void;
}

interface Tile {
  id: number;
  value: string;
  type: 'number' | 'operator';
  points: number;
  used: boolean;
}

interface BoardCell {
  row: number;
  col: number;
  tile: Tile | null;
  bonus: 'none' | 'double' | 'triple' | 'star';
}

interface Equation {
  tiles: { row: number; col: number; tile: Tile }[];
  result: number;
  isValid: boolean;
  points: number;
}

const BOARD_SIZE = 8;
const TARGET_SCORES = [100, 250, 500, 1000];

const BONUS_POSITIONS = [
  { row: 1, col: 1, bonus: 'double' as const },
  { row: 1, col: 6, bonus: 'double' as const },
  { row: 6, col: 1, bonus: 'double' as const },
  { row: 6, col: 6, bonus: 'double' as const },
  { row: 3, col: 3, bonus: 'triple' as const },
  { row: 3, col: 4, bonus: 'triple' as const },
  { row: 4, col: 3, bonus: 'triple' as const },
  { row: 4, col: 4, bonus: 'triple' as const },
  { row: 3, col: 3, bonus: 'star' as const },
];

export default function MathScrabble({ onComplete }: MathScrabbleProps) {
  const [board, setBoard] = useState<BoardCell[][]>([]);
  const [rack, setRack] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [targetScore, setTargetScore] = useState(TARGET_SCORES[0]);
  const [level, setLevel] = useState(1);
  const [selectedTileId, setSelectedTileId] = useState<number | null>(null); // PERBAIKAN: ganti ke number | null
  const [placedTiles, setPlacedTiles] = useState<{ row: number; col: number; tile: Tile }[]>([]);
  const [currentEquation, setCurrentEquation] = useState<Equation | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'complete'>('playing');
  const [movesLeft, setMovesLeft] = useState(20);
  const [hint, setHint] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [bestEquation, setBestEquation] = useState<{ score: number; text: string }>({ score: 0, text: '' });
  const [totalEquations, setTotalEquations] = useState(0);
  const [validEquations, setValidEquations] = useState(0);

  const generateTiles = useCallback(() => {
    const numbers = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i,
      value: String(i),
      type: 'number' as const,
      points: i === 0 ? 1 : i,
      used: false,
    }));
    
    const operators = ['+', '-', '×', '÷', '=', '(', ')'].map((op, i) => ({
      id: Date.now() + 20 + i,
      value: op,
      type: 'operator' as const,
      points: op === '×' || op === '÷' ? 3 : op === '=' ? 5 : 2,
      used: false,
    }));
    
    const extraNumbers = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + 30 + i,
      value: String(Math.floor(Math.random() * 9) + 1),
      type: 'number' as const,
      points: Math.floor(Math.random() * 5) + 1,
      used: false,
    }));
    
    return [...numbers, ...operators, ...extraNumbers].sort(() => Math.random() - 0.5);
  }, []);

  const initializeBoard = useCallback(() => {
    const newBoard: BoardCell[][] = Array.from({ length: BOARD_SIZE }, (_, row) =>
      Array.from({ length: BOARD_SIZE }, (_, col) => {
        const bonus = BONUS_POSITIONS.find(b => b.row === row && b.col === col);
        return {
          row,
          col,
          tile: null,
          bonus: bonus?.bonus || 'none',
        };
      })
    );
    setBoard(newBoard);
  }, []);

  const drawTiles = useCallback((count: number) => {
    const allTiles = generateTiles();
    const drawn = allTiles.slice(0, count);
    setRack(drawn);
    return drawn;
  }, [generateTiles]);

  const startGame = useCallback(() => {
    initializeBoard();
    drawTiles(7);
    setScore(0);
    setLevel(1);
    setTargetScore(TARGET_SCORES[0]);
    setMovesLeft(20);
    setPlacedTiles([]);
    setCurrentEquation(null);
    setBestEquation({ score: 0, text: '' });
    setTotalEquations(0);
    setValidEquations(0);
    setSelectedTileId(null); // PERBAIKAN: reset selectedTileId
  }, [initializeBoard, drawTiles]);

  useEffect(() => {
    startGame();
  }, []);

  const placeTileOnBoard = (row: number, col: number, tile: Tile) => {
    if (board[row][col].tile) return;
    
    const newBoard = board.map(r => r.map(c => ({ ...c })));
    newBoard[row][col].tile = tile;
    setBoard(newBoard);
    
    const newPlacedTiles = [...placedTiles, { row, col, tile }];
    setPlacedTiles(newPlacedTiles);
    
    setRack(prev => prev.filter(t => t.id !== tile.id));
    
    checkEquation(newBoard, newPlacedTiles);
  };

  const checkEquation = (currentBoard: BoardCell[][], tiles: { row: number; col: number; tile: Tile }[]) => {
    if (tiles.length >= 3) {
      const sortedByCol = [...tiles].sort((a, b) => a.col - b.col);
      const allSameRow = sortedByCol.every(t => t.row === sortedByCol[0].row);
      const consecutive = sortedByCol.every((t, i) => 
        i === 0 || t.col === sortedByCol[i-1].col + 1
      );
      
      if (allSameRow && consecutive) {
        const equationStr = sortedByCol.map(t => t.tile.value).join(' ');
        evaluateEquation(equationStr, tiles);
        return;
      }
      
      const sortedByRow = [...tiles].sort((a, b) => a.row - b.row);
      const allSameCol = sortedByRow.every(t => t.col === sortedByRow[0].col);
      const consecutiveRow = sortedByRow.every((t, i) => 
        i === 0 || t.row === sortedByRow[i-1].row + 1
      );
      
      if (allSameCol && consecutiveRow) {
        const equationStr = sortedByRow.map(t => t.tile.value).join(' ');
        evaluateEquation(equationStr, tiles);
        return;
      }
    }
    
    setCurrentEquation(null);
  };

  const evaluateEquation = (equationStr: string, tiles: { row: number; col: number; tile: Tile }[]) => {
    try {
      const parts = equationStr.split('=');
      if (parts.length !== 2) return;
      
      const leftSide = parts[0].trim();
      const rightSide = parts[1].trim();
      
      const calculatePoints = () => {
        let basePoints = tiles.reduce((sum, t) => sum + t.tile.points, 0);
        
        tiles.forEach(({ row, col }) => {
          const cell = board[row][col];
          if (cell.bonus === 'double') basePoints *= 2;
          if (cell.bonus === 'triple') basePoints *= 3;
          if (cell.bonus === 'star') basePoints += 50;
        });
        
        return basePoints;
      };
      
      const isValid = validateSimpleEquation(leftSide, rightSide);
      
      if (isValid) {
        const points = calculatePoints();
        setCurrentEquation({
          tiles,
          result: points,
          isValid: true,
          points,
        });
        
        if (points > bestEquation.score) {
          setBestEquation({ score: points, text: equationStr });
        }
      } else {
        setCurrentEquation({
          tiles,
          result: 0,
          isValid: false,
          points: 0,
        });
      }
    } catch (error) {
      setCurrentEquation(null);
    }
  };

  const validateSimpleEquation = (left: string, right: string): boolean => {
    const evaluateSide = (expr: string): number | null => {
      try {
        const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/');
        const result = Function(`'use strict'; return (${sanitized})`)();
        return typeof result === 'number' && isFinite(result) ? result : null;
      } catch {
        return null;
      }
    };
    
    const leftResult = evaluateSide(left);
    const rightResult = evaluateSide(right);
    
    if (leftResult === null || rightResult === null) return false;
    return Math.abs(leftResult - rightResult) < 0.0001;
  };

  const submitEquation = () => {
    if (!currentEquation?.isValid) return;
    
    const newScore = score + currentEquation.points;
    setScore(newScore);
    setMovesLeft(prev => prev - 1);
    setTotalEquations(prev => prev + 1);
    setValidEquations(prev => prev + 1);
    setShowFeedback(true);
    
    setPlacedTiles([]);
    setSelectedTileId(null); // PERBAIKAN: reset selectedTileId
    
    const newTiles = generateTiles().slice(0, Math.min(3, 7 - rack.length));
    setRack(prev => [...prev, ...newTiles]);
    
    if (newScore >= targetScore) {
      setLevel(prev => {
        const newLevel = prev + 1;
        setTargetScore(TARGET_SCORES[Math.min(newLevel - 1, TARGET_SCORES.length - 1)]);
        return newLevel;
      });
    }
    
    if (movesLeft <= 1 || rack.length === 0) {
      setTimeout(() => endGame(), 2000);
    }
    
    setTimeout(() => {
      setShowFeedback(false);
      setCurrentEquation(null);
    }, 1500);
  };

  const undoPlacement = (row: number, col: number) => {
    const tile = board[row][col].tile;
    if (!tile) return;
    
    const newBoard = board.map(r => r.map(c => ({ ...c })));
    newBoard[row][col].tile = null;
    setBoard(newBoard);
    
    setRack(prev => [...prev, tile]);
    setPlacedTiles(prev => prev.filter(t => !(t.row === row && t.col === col)));
    
    checkEquation(newBoard, placedTiles.filter(t => !(t.row === row && t.col === col)));
  };

  const getHint = () => {
    setShowHint(true);
    const numberTiles = rack.filter(t => t.type === 'number');
    const operatorTiles = rack.filter(t => t.type === 'operator');
    
    if (numberTiles.length >= 3 && operatorTiles.length >= 2) {
      const num1 = parseInt(numberTiles[0].value);
      const num2 = parseInt(numberTiles[1].value);
      const sum = num1 + num2;
      setHint(`Coba: ${num1} + ${num2} = ${sum}`);
    } else {
      setHint('Tarik lebih banyak angka untuk membuat persamaan');
    }
  };

  const endGame = () => {
    setGameState('complete');
    const stars = score >= 1000 ? 3 : score >= 500 ? 2 : 1;
    onComplete(stars, { 
      score, 
      level, 
      totalEquations, 
      validEquations,
      bestEquation: bestEquation.text 
    });
  };

  if (gameState === 'complete') {
    const stars = score >= 1000 ? 3 : score >= 500 ? 2 : 1;
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold mb-2">MathScrabble Selesai!</h2>
        <p className="text-lg mb-1">Skor Akhir: {score}</p>
        <p className="text-gray-600 mb-1">Level Dicapai: {level}</p>
        <p className="text-gray-600 mb-1">Persamaan Benar: {validEquations}/{totalEquations}</p>
        <p className="text-gray-600 mb-2">Persamaan Terbaik: {bestEquation.text} ({bestEquation.score} poin)</p>
        <div className="flex justify-center gap-2 text-4xl">
          {stars >= 1 && '⭐'}
          {stars >= 2 && '⭐'}
          {stars >= 3 && '⭐'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Game Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 rounded-full px-4 py-2 font-bold">
            ⭐ {score} / {targetScore}
          </div>
          <div className="bg-blue-100 rounded-full px-4 py-2 font-bold">
            📝 {movesLeft} langkah
          </div>
          <div className="bg-purple-100 rounded-full px-4 py-2 font-bold">
            🎯 Level {level}
          </div>
        </div>
      </div>
      
      {/* Game Board */}
      <div className="bg-green-100 rounded-2xl p-4 mb-4 shadow-lg">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
          {board.map((row, rowIdx) =>
            row.map((cell, colIdx) => (
              <button
                key={`${rowIdx}-${colIdx}`}
                onClick={() => {
                  if (cell.tile) {
                    undoPlacement(rowIdx, colIdx);
                  } else if (selectedTileId !== null) {
                    // PERBAIKAN: cari tile berdasarkan id
                    const tile = rack.find(t => t.id === selectedTileId);
                    if (tile) {
                      placeTileOnBoard(rowIdx, colIdx, tile);
                      setSelectedTileId(null);
                    }
                  }
                }}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm sm:text-base font-bold transition-all relative ${
                  cell.tile
                    ? cell.tile.type === 'number'
                      ? 'bg-blue-400 text-white shadow-md'
                      : 'bg-orange-400 text-white shadow-md'
                    : cell.bonus === 'double'
                    ? 'bg-yellow-200 hover:bg-yellow-300 border-2 border-yellow-400'
                    : cell.bonus === 'triple'
                    ? 'bg-pink-200 hover:bg-pink-300 border-2 border-pink-400'
                    : cell.bonus === 'star'
                    ? 'bg-purple-200 hover:bg-purple-300 border-2 border-purple-400'
                    : 'bg-white hover:bg-gray-50 border border-gray-200'
                }`}
                title={
                  cell.bonus !== 'none'
                    ? `${cell.bonus.toUpperCase()} Score!`
                    : `Baris ${rowIdx + 1}, Kolom ${colIdx + 1}`
                }
              >
                {cell.tile ? cell.tile.value : cell.bonus !== 'none' ? '⭐' : ''}
                {cell.bonus !== 'none' && !cell.tile && (
                  <span className="absolute -top-1 -right-1 text-xs">
                    {cell.bonus === 'double' ? '2x' : cell.bonus === 'triple' ? '3x' : '⭐'}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
      
      {/* Player Rack */}
      <div className="bg-gray-100 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-bold">🎴 Rak Kamu:</h3>
          <button
            onClick={getHint}
            className="text-sm bg-yellow-400 text-white px-3 py-1 rounded-full hover:bg-yellow-500"
          >
            💡 Hint
          </button>
          <button
            onClick={() => {
              setRack([]);
              drawTiles(7);
              setPlacedTiles([]);
              setSelectedTileId(null);
            }}
            className="text-sm bg-red-400 text-white px-3 py-1 rounded-full hover:bg-red-500"
          >
            🔄 Reset
          </button>
        </div>
        
        {showHint && (
          <div className="bg-yellow-50 rounded-lg p-2 mb-3 text-sm">
            {hint}
            <button onClick={() => setShowHint(false)} className="ml-2 text-red-500">✕</button>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          {rack.map((tile) => (
            <button
              key={tile.id}
              onClick={() => setSelectedTileId(selectedTileId === tile.id ? null : tile.id)} // PERBAIKAN: toggle selection
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-bold text-lg transition transform hover:scale-110 ${
                tile.type === 'number'
                  ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-md'
                  : 'bg-gradient-to-br from-orange-400 to-red-400 text-white shadow-md'
              } ${
                selectedTileId === tile.id ? 'ring-4 ring-yellow-400 scale-110' : '' // PERBAIKAN: compare dengan tile.id
              }`}
              title={`${tile.type === 'number' ? 'Angka' : 'Operator'}: ${tile.value} (${tile.points} poin)`}
            >
              {tile.value}
              <span className="absolute -bottom-1 -right-1 text-xs bg-white rounded-full w-5 h-5 flex items-center justify-center text-gray-700 font-bold">
                {tile.points}
              </span>
            </button>
          ))}
        </div>
        
        {/* Current Equation */}
        {currentEquation && (
          <div className={`mt-4 p-3 rounded-xl ${
            currentEquation.isValid ? 'bg-green-100 border-2 border-green-300' : 'bg-red-100 border-2 border-red-300'
          }`}>
            <div className="flex justify-between items-center">
              <span className="font-bold">
                {currentEquation.isValid ? '✅ Persamaan Valid!' : '❌ Persamaan Tidak Valid'}
              </span>
              {currentEquation.isValid && (
                <span className="text-lg font-bold text-green-600">
                  +{currentEquation.points} poin
                </span>
              )}
            </div>
            {currentEquation.isValid && (
              <button
                onClick={submitEquation}
                className="mt-2 w-full bg-gradient-to-r from-green-400 to-emerald-400 text-white p-2 rounded-xl font-bold hover:scale-105 transition"
              >
                ✅ Submit Persamaan!
              </button>
            )}
          </div>
        )}
        
        {/* Best Equation */}
        {bestEquation.score > 0 && (
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-500">
              🏆 Terbaik: {bestEquation.text} ({bestEquation.score} poin)
            </span>
          </div>
        )}
      </div>
      
      {/* Feedback Overlay */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 text-center">
            <div className="text-5xl mb-2">🎉</div>
            <p className="text-xl font-bold text-green-600">
              +{currentEquation?.points || 0} Poin!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {movesLeft} langkah tersisa
            </p>
          </div>
        </div>
      )}
    </div>
  );
}