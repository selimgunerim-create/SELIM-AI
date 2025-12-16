import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, Swords, Zap, Brain, User, Bot as BotIcon } from 'lucide-react';

interface MiniGameProps {
  onClose: () => void;
}

type Difficulty = 'easy' | 'medium' | 'hard';
type GameState = 'menu' | 'matchmaking' | 'playing' | 'gameover';

export const MiniGame: React.FC<MiniGameProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [score, setScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [question, setQuestion] = useState({ text: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  
  // Opponent simulation refs
  const opponentIntervalRef = useRef<number | null>(null);

  // Generate Question based on difficulty
  const generateQuestion = (diff: Difficulty) => {
    let num1, num2;
    switch (diff) {
      case 'easy':
        num1 = Math.floor(Math.random() * 9) + 2; // 2-10
        num2 = Math.floor(Math.random() * 9) + 2;
        break;
      case 'medium':
        num1 = Math.floor(Math.random() * 10) + 5; // 5-15
        num2 = Math.floor(Math.random() * 10) + 2;
        break;
      case 'hard':
        num1 = Math.floor(Math.random() * 15) + 5; // 5-20
        num2 = Math.floor(Math.random() * 15) + 5;
        break;
    }
    return { text: `${num1} x ${num2}`, answer: num1 * num2 };
  };

  const startGame = () => {
    setGameState('matchmaking');
    // Simulate finding an opponent
    setTimeout(() => {
      setGameState('playing');
      setScore(0);
      setOpponentScore(0);
      setTimeLeft(60);
      setQuestion(generateQuestion(difficulty));
      startOpponentBot();
    }, 2000);
  };

  const startOpponentBot = () => {
    // Bot difficulty adjustment
    const botSpeed = difficulty === 'easy' ? 4000 : difficulty === 'medium' ? 3000 : 2000;
    
    if (opponentIntervalRef.current) clearInterval(opponentIntervalRef.current);

    opponentIntervalRef.current = window.setInterval(() => {
      // Bot has 70% chance to be correct
      if (Math.random() > 0.3) {
         setOpponentScore(prev => prev + 10);
      } else {
         setOpponentScore(prev => Math.max(0, prev - 10));
      }
    }, botSpeed);
  };

  useEffect(() => {
    let timer: number;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('gameover');
      if (opponentIntervalRef.current) clearInterval(opponentIntervalRef.current);
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
        if (opponentIntervalRef.current) clearInterval(opponentIntervalRef.current);
    };
  }, []);

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(userAnswer);
    if (isNaN(val)) return;

    if (val === question.answer) {
      setScore(prev => prev + 10);
      setMessage('Doğru! +10');
      // Flash green effect logic could go here
    } else {
      setScore(prev => prev - 10);
      setMessage(`Yanlış! (${question.answer}) -10`);
    }
    setUserAnswer('');
    setQuestion(generateQuestion(difficulty));
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border-4 border-indigo-500 relative">
        
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Swords size={24} />
            <h2 className="font-bold text-xl">Matematik Arenası</h2>
          </div>
          <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-indigo-50 min-h-[400px] flex flex-col items-center justify-center">
          
          {gameState === 'menu' && (
            <div className="w-full space-y-6 text-center">
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-gray-800 font-bold text-lg mb-4">Zorluk Seviyesi</h3>
                <div className="flex gap-2 justify-center">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                        difficulty === d 
                        ? 'bg-indigo-600 text-white scale-105 shadow-md' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor'}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={startGame}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
              >
                <Zap size={24} className="fill-current" />
                Çevrimiçi Yarışma Başla
              </button>
              <p className="text-sm text-gray-500">Rakip aranacak ve eşleşme sağlanacaktır.</p>
            </div>
          )}

          {gameState === 'matchmaking' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
              <h3 className="text-xl font-bold text-indigo-800">Rakip Aranıyor...</h3>
              <p className="text-gray-500">Uygun seviyedeki oyuncular taranıyor.</p>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="w-full h-full flex flex-col justify-between">
              
              {/* Scoreboard */}
              <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-xl shadow-sm">
                <div className="text-center px-4">
                    <div className="flex items-center gap-1 text-blue-600 font-bold"><User size={16}/> SEN</div>
                    <div className="text-2xl font-black text-gray-800">{score}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Süre</div>
                    <div className={`text-3xl font-mono font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                        {timeLeft}
                    </div>
                </div>
                <div className="text-center px-4">
                    <div className="flex items-center gap-1 text-red-600 font-bold"><BotIcon size={16}/> RAKİP</div>
                    <div className="text-2xl font-black text-gray-800">{opponentScore}</div>
                </div>
              </div>

              {/* Question Area */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="text-6xl font-black text-indigo-900 drop-shadow-sm">
                  {question.text} = ?
                </div>
                
                <div className="h-8 text-orange-600 font-bold">{message}</div>

                <form onSubmit={handleAnswerSubmit} className="w-full max-w-xs">
                  <input
                    type="number"
                    autoFocus
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Sonucu yaz..."
                    className="w-full text-center text-3xl font-bold py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  />
                  <button type="submit" className="hidden">Gönder</button>
                </form>
              </div>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="text-center space-y-6 animate-in zoom-in duration-300">
               <div className="inline-block p-4 rounded-full bg-yellow-100 text-yellow-600 mb-2">
                 <Trophy size={48} />
               </div>
               
               <div>
                   <h2 className="text-3xl font-black text-gray-800 mb-2">
                       {score > opponentScore ? 'KAZANDIN!' : score < opponentScore ? 'KAYBETTİN!' : 'BERABERE!'}
                   </h2>
                   <p className="text-gray-600">Skorun: <span className="font-bold text-indigo-600 text-xl">{score}</span></p>
                   <p className="text-gray-500 text-sm">Rakip Skoru: {opponentScore}</p>
               </div>

               <div className="flex gap-3 pt-4">
                   <button onClick={() => setGameState('menu')} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition">
                       Menüye Dön
                   </button>
                   <button onClick={startGame} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
                       Tekrar Oyna
                   </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};