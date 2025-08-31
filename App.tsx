
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, ChallengeProps, ChallengeData } from './types';
import { generateTaunt, generateVagueInstruction, generateMathTaunt, generateAdminCode } from './services/geminiService';

// --- ICONS --- //
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RobotIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        <line x1="10" y1="15" x2="10" y2="17"></line>
        <line x1="14" y1="15" x2="14" y2="17"></line>
    </svg>
);

const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const Spinner: React.FC = () => (
    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
);

// --- CHALLENGE COMPONENTS --- //
// Defined outside App to prevent re-creation on re-renders

const Level1_Checkbox: React.FC<ChallengeProps> = ({ onComplete }) => {
    const [isChecked, setIsChecked] = useState(false);
    useEffect(() => {
        if (isChecked) {
            const timer = setTimeout(() => onComplete(true), 500);
            return () => clearTimeout(timer);
        }
    }, [isChecked, onComplete]);

    return (
        <div className="flex items-center justify-center p-4">
            <div 
                className="w-8 h-8 border-2 border-gray-400 rounded-md cursor-pointer flex items-center justify-center transition-colors bg-white"
                onClick={() => setIsChecked(true)}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
            >
                {isChecked && <CheckIcon className="w-6 h-6 text-green-500" />}
            </div>
            <span className="ml-4 text-lg text-gray-800">I'm not a robot</span>
        </div>
    );
};

const Level2_SimpleText: React.FC<ChallengeProps> = ({ onComplete, data }) => {
    const [text, setText] = useState('');
    const targetText = useMemo(() => data.payload?.text || 'human', [data.payload]);
    
    const handleVerify = () => {
        onComplete(text.toLowerCase().trim() === targetText.toLowerCase());
    };

    return (
        <div className="p-4 space-y-4">
            <div className="text-center bg-gray-200 p-3 rounded-lg select-none">
                <p className="text-3xl font-serif tracking-widest italic text-gray-700">{targetText}</p>
            </div>
            <input 
                type="text" 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type the text above"
                aria-label="Text to verify"
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            <button onClick={handleVerify} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">Verify</button>
        </div>
    );
};

const Level3_ImageGrid: React.FC<ChallengeProps> = ({ onComplete, data }) => {
    const [selected, setSelected] = useState<number[]>([]);
    const { correctIndices, imageKeywords } = useMemo(() => ({
        correctIndices: data.payload?.correctIndices || [],
        imageKeywords: data.payload?.imageKeywords || Array(9).fill('abstract') // Fallback
    }), [data.payload]);

    const toggleSelect = (index: number) => {
        setSelected(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleVerify = () => {
        const isCorrect = selected.length === correctIndices.length && selected.every(i => correctIndices.includes(i));
        onComplete(isCorrect);
    };

    return (
        <div className="p-2 space-y-2">
            <div className="grid grid-cols-3 gap-2">
                {imageKeywords.map((keyword: string, i: number) => (
                    <div key={i} className="relative cursor-pointer group" onClick={() => toggleSelect(i)} role="button" tabIndex={0} aria-pressed={selected.includes(i)}>
                        <img 
                            src={`https://source.unsplash.com/150x150/?${keyword}&sig=${i}`} 
                            alt={`${keyword}`} 
                            className="w-full h-full object-cover rounded-md bg-gray-200"
                        />
                        {selected.includes(i) && (
                            <div className="absolute inset-0 bg-blue-500 bg-opacity-50 flex items-center justify-center rounded-md">
                                <CheckIcon className="w-10 h-10 text-white" />
                            </div>
                        )}
                         <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md"></div>
                    </div>
                ))}
            </div>
            <button onClick={handleVerify} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">Verify</button>
        </div>
    );
};


const Level4_Slider: React.FC<ChallengeProps> = ({ onComplete }) => {
    const [position, setPosition] = useState(0);
    const [isSliding, setIsSliding] = useState(false);

    const handleMouseUp = () => {
        setIsSliding(false);
        if (position > 95) {
            onComplete(true);
        } else {
            // Snap back aggressively
            setPosition(0);
        }
    };
    
    const handleMouseDown = () => {
        setIsSliding(true);
    }
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isSliding) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        let newPosition = (x / rect.width) * 100;

        // make it "sticky" and harder to slide
        if (newPosition > 60 && newPosition < 98) {
            // add some random jumps back
            if (Math.random() > 0.6) {
                newPosition -= Math.random() * 25;
            }
            // add a consistent pull back
            const pullFactor = (98 - newPosition) / 38; // stronger pull closer to 98
            newPosition -= Math.random() * 15 * pullFactor;
        }

        setPosition(Math.max(0, Math.min(100, newPosition)));
    }


    return (
        <div className="p-4 space-y-4" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <div 
                className="w-full h-12 bg-gray-200 rounded-full relative select-none cursor-pointer"
                onMouseMove={handleMouseMove}
                aria-label="Verification slider"
            >
                <div 
                    className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-75"
                    style={{ width: `${position}%` }}
                ></div>
                <div 
                    className="absolute top-0 h-12 w-12 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center shadow-lg transition-all duration-75"
                    style={{ left: `calc(${position}% - 24px)` }}
                    onMouseDown={handleMouseDown}
                    role="slider"
                    aria-valuenow={position}
                >
                    <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
                <span className={`absolute inset-0 flex items-center justify-center text-gray-500 font-medium transition-opacity ${position > 50 ? 'opacity-0' : 'opacity-100'}`}>Slide to verify</span>
            </div>
        </div>
    );
};

const Level5_MathProblem: React.FC<ChallengeProps> = ({ onComplete }) => {
    const [answer, setAnswer] = useState('');
    const [wrongAttempts, setWrongAttempts] = useState(0);
    const [feedback, setFeedback] = useState<string | null>('Solve for x.');
    const [isVerifying, setIsVerifying] = useState(false);
    const [options, setOptions] = useState<number[] | null>(null);

    const handleVerify = async () => {
        if (isVerifying) return;
        if (answer.trim() === '3') {
            onComplete(true);
            return;
        }
        
        // Don't call onComplete(false) here. Just handle internal state.
        setIsVerifying(true);
        const currentAnswer = answer || 'nothing'; // Handle empty submission
        setAnswer(''); // Clear input
        const taunt = await generateMathTaunt(currentAnswer);
        setFeedback(taunt);
        const newWrongAttempts = wrongAttempts + 1;
        setWrongAttempts(newWrongAttempts);

        if (newWrongAttempts === 4) {
            setOptions([2, 5, 3, -1].sort(() => Math.random() - 0.5));
        } else if (newWrongAttempts === 6) {
            setOptions([5, 3].sort(() => Math.random() - 0.5));
        } else if (newWrongAttempts >= 7) {
            setOptions([3]);
        }
        setIsVerifying(false);
    };
    
    const handleOptionClick = async (option: number) => {
        if (isVerifying) return;
        if (option === 3) {
            onComplete(true);
            return;
        }
        
        // Don't call onComplete(false). Mock the user and remove the option.
        setIsVerifying(true);
        const taunt = await generateMathTaunt(String(option));
        setFeedback(taunt);
        setOptions(prev => prev?.filter(o => o !== option) || null);
        setIsVerifying(false);
    }

    return (
        <div className="p-4 space-y-4">
            <div className="text-center bg-gray-200 p-3 rounded-lg select-none">
                <p className="text-lg font-mono text-gray-800 break-words">
                    (x-2)²(x-3)² + (x-2)²(x-3) + (x-3)² = 0
                </p>
            </div>

            <div className="text-center min-h-[2.5rem] flex items-center justify-center">
                {isVerifying ? <Spinner /> : <p className="text-sm text-red-600 font-medium" role="alert">{feedback}</p>}
            </div>

            {wrongAttempts < 4 ? (
                <>
                    <input
                        type="number"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        placeholder="Enter value for x"
                        disabled={isVerifying}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    />
                    <button onClick={handleVerify} disabled={isVerifying || answer === ''} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                        {isVerifying ? 'Thinking...' : 'Verify'}
                    </button>
                </>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {options?.map(opt => (
                        <button key={opt} onClick={() => handleOptionClick(opt)} className="bg-blue-500 text-white p-4 rounded-md hover:bg-blue-600 transition-colors text-xl font-bold disabled:bg-gray-400" disabled={isVerifying}>
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Level6_FindTheDifference: React.FC<ChallengeProps> = ({ onComplete }) => {
    // The trick is to select nothing
    const handleVerify = () => {
        onComplete(true);
    };

    return (
        <div className="p-2 space-y-2">
            <div className="grid grid-cols-3 gap-2">
                {[...Array(9)].map((_, i) => (
                    <img key={i} src={`https://picsum.photos/150/150?random=42`} alt="all the same" className="w-full h-full object-cover rounded-md" />
                ))}
            </div>
            <button onClick={handleVerify} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">Verify</button>
        </div>
    );
};

const Level7_VagueInstruction: React.FC<ChallengeProps> = ({ onComplete, data }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [instruction, setInstruction] = useState("Please wait...");
    
    useEffect(() => {
        generateVagueInstruction().then(instr => {
            setInstruction(instr);
            setIsLoading(false);
        });
    }, []);

    // Any click is the "right" one for this frustrating level
    const handleVerify = () => {
        onComplete(true);
    };

    return (
        <div className="p-2 space-y-2">
            {isLoading ? <div className="h-12 flex justify-center items-center"><Spinner /></div> : 
                <p className="text-center font-bold text-lg p-2 bg-blue-100 text-blue-800 rounded-md">{instruction}</p>
            }
            <div className="grid grid-cols-3 gap-2">
                 {[...Array(9)].map((_, i) => (
                    <div key={i} className="relative cursor-pointer group" onClick={handleVerify}>
                        <img src={`https://picsum.photos/150/150?random=${i+data.level}`} alt={`captcha-option-${i}`} className="w-full h-full object-cover rounded-md" />
                         <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const GlitchyButton: React.FC<{onClick: () => void}> = ({onClick}) => {
    const [pos, setPos] = useState({x: 0, y: 0});

    const handleMouseEnter = () => {
        // Jump further and faster
        setPos({
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200
        })
    }

    return (
        <button 
            onMouseEnter={handleMouseEnter}
            onClick={onClick}
            style={{transform: `translate(${pos.x}px, ${pos.y}px)`}}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-all duration-100 ease-out"
        >
            Verify
        </button>
    )
}

const Level8_GlitchingUI: React.FC<ChallengeProps> = ({ onComplete }) => {
    return (
        <div className="p-4 space-y-2 h-64 relative overflow-hidden">
             <div className="text-center bg-gray-200 p-3 rounded-lg select-none">
                <p className="text-3xl font-serif tracking-widest italic text-gray-700">Verify</p>
            </div>
            <p className="text-center text-gray-600">Please click the verify button to continue.</p>
            <div className="absolute inset-0 flex items-center justify-center">
                <GlitchyButton onClick={() => onComplete(true)} />
            </div>
        </div>
    );
};

// --- MAIN APP --- //

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [failMessage, setFailMessage] = useState('');
  const [adminCode, setAdminCode] = useState<string | null>(null);

  const challenges: ChallengeData[] = useMemo(() => [
    { level: 1, title: 'Standard Verification', component: Level1_Checkbox },
    { level: 2, title: 'Text Recognition', instruction: 'Please type the following word:', component: Level2_SimpleText, payload: { text: 'I am a human' } },
    { level: 3, title: 'Image Recognition', instruction: 'Select all images containing felines.', component: Level3_ImageGrid, payload: { imageKeywords: ['calico cat', 'tabby cat', 'lion', 'dog', 'tiger', 'sofa', 'feline', 'kitten', 'car'], correctIndices: [0, 1, 2, 4, 6, 7] } },
    { level: 4, title: 'Human Interaction', instruction: 'Slide to confirm you are not a robot.', component: Level4_Slider },
    { level: 5, title: 'Advanced Reasoning', instruction: 'To verify yourself, solve this simple math equation.', component: Level5_MathProblem },
    { level: 6, title: 'Cognitive Test', instruction: 'Click all the differences in the images.', component: Level6_FindTheDifference },
    { level: 7, title: 'Abstract Association', instruction: 'Follow the instruction below.', component: Level7_VagueInstruction },
    { level: 8, title: 'UI Interaction Test', instruction: 'Confirm your action.', component: Level8_GlitchingUI },
  ], []);

  const handleChallengeComplete = useCallback((success: boolean) => {
    if (!success) {
        setGameState(GameState.VERIFYING);
        generateTaunt(currentLevel + 1, 1).then(msg => {
            setFailMessage(msg);
            setTimeout(() => setGameState(GameState.FINAL_FAIL), 1500);
        });
        return;
    }
    
    setGameState(GameState.VERIFYING);
    setTimeout(() => {
      if (currentLevel < challenges.length - 1) {
        setCurrentLevel(prev => prev + 1);
        setGameState(GameState.PLAYING);
      } else {
        // All challenges completed successfully
        generateAdminCode().then(code => {
            setAdminCode(code);
            setGameState(GameState.FINAL_SUCCESS);
        });
      }
    }, 700);
  }, [currentLevel, challenges.length]);

  const restartGame = () => {
    setCurrentLevel(0);
    setFailMessage('');
    setAdminCode(null);
    setGameState(GameState.START);
  };
  
  const startGame = () => {
    setGameState(GameState.LOADING);
    setTimeout(() => {
        setGameState(GameState.PLAYING)
    }, 1000);
  }

  const renderGameState = () => {
    const currentChallenge = challenges[currentLevel];
    const ChallengeComponent = currentChallenge.component;

    switch (gameState) {
      case GameState.START:
        return (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Human Verification Required</h1>
            <p className="mb-6 text-gray-600">Please complete the following challenges to prove you are not a robot.</p>
            <button onClick={startGame} className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-transform hover:scale-105">Start Verification</button>
          </div>
        );
      case GameState.LOADING:
        return (
            <div className="flex flex-col items-center justify-center space-y-4">
                <Spinner />
                <p className="text-lg text-gray-700">Initializing verification module...</p>
            </div>
        );
      case GameState.PLAYING:
        return (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${((currentLevel + 1) / challenges.length) * 100}%` }}></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">{currentChallenge.title}</h2>
            <p className="text-gray-600 mb-4">{currentChallenge.instruction}</p>
            <ChallengeComponent 
                key={currentLevel} 
                onComplete={handleChallengeComplete}
                data={currentChallenge}
            />
          </>
        );
    case GameState.VERIFYING:
        return (
             <div className="flex flex-col items-center justify-center space-y-4">
                <Spinner />
                <p className="text-lg text-green-700">Verified.</p>
            </div>
        );
    case GameState.FINAL_FAIL:
        return (
            <div className="text-center flex flex-col items-center animate-pulse">
                <RobotIcon className="w-24 h-24 text-red-500 mb-4" />
                <h2 className="text-3xl font-bold text-red-600 mb-2">ROBOT DETECTED</h2>
                <p className="text-lg text-gray-700 mb-6">{failMessage || "System integrity compromised. Restarting."}</p>
                <button onClick={restartGame} className="bg-gray-600 text-white px-8 py-3 rounded-md hover:bg-gray-700">Try Again</button>
            </div>
        );
    case GameState.FINAL_SUCCESS:
        return (
            <div className="text-center flex flex-col items-center">
                <DocumentIcon className="w-24 h-24 text-green-600 mb-4" />
                <h2 className="text-3xl font-bold text-green-700 mb-2">Verification Complete</h2>
                <p className="text-gray-700 mb-4">Don't forget to write down your service ticket for the off-site location.</p>
                <div className="bg-gray-200 p-4 rounded-lg w-full mb-6">
                    <p className="text-lg font-mono text-gray-800 break-all" aria-label="Your admin code">{adminCode}</p>
                </div>
                <button onClick={restartGame} className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700">Restart</button>
            </div>
        )
      default:
        return <p>Error: Unknown game state.</p>;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl p-6 relative overflow-hidden">
        <div className="p-4 min-h-[250px] flex flex-col justify-center">
          {renderGameState()}
        </div>
        <footer className="text-center text-xs text-gray-400 border-t border-gray-200 pt-4 mt-4">
          <p>Powered by CRAPCHA technology</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
