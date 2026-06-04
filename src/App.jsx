import React, { useState, useEffect, useRef } from 'react';

// Starter built-in puzzles using high-quality Unsplash image URLs
const DEFAULT_PUZZLES = [
  {
    id: 'puzzle-1',
    answer: 'MASARAP',
    images: [
      'https://i.imgur.com/vilgHgN.jpeg',
      'https://i.imgur.com/vilgHgN.jpeg',
      'https://i.imgur.com/vilgHgN.jpeg',
      'https://i.imgur.com/vilgHgN.jpeg'
    ]
  },
  {
    id: 'puzzle-2',
    answer: 'BINIBINI',
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop'
    ]
  },
  {
    id: 'puzzle-3',
    answer: 'BOOK',
    images: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop'
    ]
  },
  {
    id: 'puzzle-4',
    answer: 'FIRE',
    images: [
      'https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1520116468816-95b69f847357?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1482005253821-5d6a2c685879?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=300&h=300&fit=crop'
    ]
  },
  {
    id: 'puzzle-5',
    answer: 'RAIN',
    images: [
      'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1514632595861-4d918e39276c?w=300&h=300&fit=crop'
    ]
  },
  {
    id: 'puzzle-6',
    answer: 'TREE',
    images: [
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=300&h=300&fit=crop'
    ]
  }
];

export default function App() {
  // --- STATE ---
  const [puzzles, setPuzzles] = useState(() => {
    const saved = localStorage.getItem('four_pics_puzzles');
    return saved ? JSON.parse(saved) : DEFAULT_PUZZLES;
  });

  const [currentIdx, setCurrentIdx] = useState(() => {
    const saved = localStorage.getItem('four_pics_current_idx');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem('four_pics_score');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Current active puzzle object
  const activePuzzle = puzzles[currentIdx] || puzzles[0] || DEFAULT_PUZZLES[0];

  // Letters currently guessed by the player (matches answer length)
  const [guesses, setGuesses] = useState([]);
  
  // Scrambled pool of 12 letters for selection
  const [letterPool, setLetterPool] = useState([]);

  // Animation states
  const [shake, setShake] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Modal / Lightbox / Sidepanel controls
  const [lightboxImg, setLightboxImg] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Local editor draft state to avoid saving immediately on every typing keystroke
  const [editorPuzzles, setEditorPuzzles] = useState([]);

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('four_pics_puzzles', JSON.stringify(puzzles));
  }, [puzzles]);

  useEffect(() => {
    localStorage.setItem('four_pics_current_idx', currentIdx.toString());
  }, [currentIdx]);

  useEffect(() => {
    localStorage.setItem('four_pics_score', score.toString());
  }, [score]);

  // --- PUZZLE INITIALIZATION ENGINE ---
  useEffect(() => {
    if (!activePuzzle) return;
    
    // Initialize Guesses
    setGuesses(Array(activePuzzle.answer.length).fill(null));
    
    // Scramble letters
    const answerChars = activePuzzle.answer.toUpperCase().split('');
    const extraChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const totalLetters = [...answerChars];
    
    while (totalLetters.length < 12) {
      const randChar = extraChars[Math.floor(Math.random() * extraChars.length)];
      totalLetters.push(randChar);
    }
    
    // Shuffle the pool of letters
    const scrambled = totalLetters
      .map((char, index) => ({ id: index, letter: char, isUsed: false }))
      .sort(() => Math.random() - 0.5);
      
    setLetterPool(scrambled);
    setIsSuccess(false);
  }, [currentIdx, puzzles, activePuzzle]);

  // --- AUTO ANSWER VALIDATION ---
  useEffect(() => {
    if (guesses.length === 0 || guesses.includes(null) || isSuccess) return;

    const currentWord = guesses.map(g => g.letter).join('');
    const solution = activePuzzle.answer.toUpperCase();

    if (currentWord === solution) {
      // SUCCESS!
      setIsSuccess(true);
      setScore(prev => prev + 10);
    } else {
      // FAILURE - SHAKE AND CLEAR
      setShake(true);
      const timer = setTimeout(() => {
        setShake(false);
        // Clear guesses and reset pool items
        setGuesses(Array(activePuzzle.answer.length).fill(null));
        setLetterPool(prev => prev.map(tile => ({ ...tile, isUsed: false })));
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [guesses, activePuzzle, isSuccess]);

  // --- TAPPING ACTIONS ---
  const handleTileClick = (tile) => {
    if (tile.isUsed || isSuccess || shake) return;

    const emptyIdx = guesses.findIndex(g => g === null);
    if (emptyIdx === -1) return; // No open slot

    const updatedGuesses = [...guesses];
    updatedGuesses[emptyIdx] = { poolId: tile.id, letter: tile.letter };
    setGuesses(updatedGuesses);

    setLetterPool(prev => prev.map(t => (t.id === tile.id ? { ...t, isUsed: true } : t)));
  };

  const handleGuessClick = (guessItem, idx) => {
    if (!guessItem || isSuccess || shake) return;

    // Clear slot
    const updatedGuesses = [...guesses];
    updatedGuesses[idx] = null;
    setGuesses(updatedGuesses);

    // Return letter back to the pool
    setLetterPool(prev =>
      prev.map(t => (t.id === guessItem.poolId ? { ...t, isUsed: false } : t))
    );
  };

  // --- GAME ACTIONS / HELPERS ---
  const handleNextLevel = () => {
    setIsSuccess(false);
    if (currentIdx < puzzles.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Loop back to round 1 if completed all
      setCurrentIdx(0);
    }
  };

  const handleSkipLevel = () => {
    if (score < 30) {
      alert("You need at least 30 ⭐ to skip this round!");
      return;
    }
    setScore(prev => prev - 30);
    handleNextLevel();
  };

  const handleRevealLetter = () => {
    if (score < 15) {
      alert("You need at least 15 ⭐ to reveal a letter!");
      return;
    }

    const emptyIdx = guesses.findIndex(g => g === null);
    if (emptyIdx === -1) return;

    const targetChar = activePuzzle.answer[emptyIdx].toUpperCase();
    
    // Find matching letter in letterPool that is NOT used yet
    const poolTile = letterPool.find(t => t.letter === targetChar && !t.isUsed);
    
    if (poolTile) {
      setScore(prev => prev - 15);
      // Place in guess slot
      const updatedGuesses = [...guesses];
      updatedGuesses[emptyIdx] = { poolId: poolTile.id, letter: poolTile.letter };
      setGuesses(updatedGuesses);

      // Lock pool tile
      setLetterPool(prev => prev.map(t => (t.id === poolTile.id ? { ...t, isUsed: true } : t)));
    } else {
      alert("No available tiles to reveal this letter! Try clearing some tiles first.");
    }
  };

  // --- EDITOR FUNCTIONALITY ---
  const openEditor = () => {
    // Deep clone state to temporary working state
    setEditorPuzzles(JSON.parse(JSON.stringify(puzzles)));
    setEditMode(true);
  };

  const updateEditorPuzzleWord = (puzIdx, word) => {
    const updated = [...editorPuzzles];
    updated[puzIdx].answer = word.toUpperCase().replace(/[^A-Z]/g, '');
    setEditorPuzzles(updated);
  };

  const updateEditorPuzzleImg = (puzIdx, imgIdx, url) => {
    const updated = [...editorPuzzles];
    updated[puzIdx].images[imgIdx] = url;
    setEditorPuzzles(updated);
  };

  const handleAddNewPuzzle = () => {
    const newPuzzle = {
      id: `puzzle-${Date.now()}`,
      answer: 'NEW',
      images: [
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&h=300&fit=crop'
      ]
    };
    setEditorPuzzles([...editorPuzzles, newPuzzle]);
  };

  const handleDeletePuzzle = (puzIdx) => {
    if (editorPuzzles.length <= 1) {
      alert("You must keep at least 1 puzzle!");
      return;
    }
    const updated = editorPuzzles.filter((_, i) => i !== puzIdx);
    setEditorPuzzles(updated);
  };

  const handleSaveEditor = () => {
    // Basic validation
    for (let i = 0; i < editorPuzzles.length; i++) {
      const p = editorPuzzles[i];
      if (!p.answer || p.answer.length < 2) {
        alert(`Error in Round ${i + 1}: Word must be at least 2 characters!`);
        return;
      }
      if (p.images.some(img => !img.trim())) {
        alert(`Error in Round ${i + 1}: All 4 image URLs must be filled!`);
        return;
      }
    }

    setPuzzles(editorPuzzles);
    
    // Check bounds of current active index
    if (currentIdx >= editorPuzzles.length) {
      setCurrentIdx(0);
    }
    
    setEditMode(false);
  };

  const handleResetToDefaults = () => {
    if (window.confirm("Are you sure you want to restore default puzzles? This will delete all custom puzzles.")) {
      setPuzzles(DEFAULT_PUZZLES);
      setCurrentIdx(0);
      setScore(0);
      setEditMode(false);
    }
  };

  // --- RENDER CONFETTI FOR SUCCESS STATE ---
  const renderConfetti = () => {
    const colors = ['#f59e0b', '#f97316', '#fbbf24', '#f43f5e', '#10b981', '#3b82f6'];
    return (
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 50
      }}>
        {Array.from({ length: 40 }).map((_, i) => {
          const color = colors[Math.floor(Math.random() * colors.length)];
          const size = Math.random() * 8 + 6;
          const left = Math.random() * 100;
          const delay = Math.random() * 1.5;
          const duration = Math.random() * 2 + 2;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                borderRadius: Math.random() > 0.5 ? '50%' : '20%',
                top: '-10px',
                left: `${left}%`,
                opacity: 0.8,
                transform: `rotate(${Math.random() * 360}deg)`,
                animation: `fall ${duration}s linear ${delay}s infinite`
              }}
            />
          );
        })}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fall {
            0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(600px) rotate(360deg); opacity: 0; }
          }
        `}} />
      </div>
    );
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '480px',
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      padding: '16px 12px 24px 12px'
    }}>
      
      {/* --- HEADER --- */}
      <header className="glass-panel" style={{
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        border: '1px solid rgba(251, 191, 36, 0.3)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#7c2d12',
            letterSpacing: '-0.025em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            🖼️ 4 Pics 1 Word
          </h1>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309', marginTop: '2px' }}>
            ROUND {currentIdx + 1} OF {puzzles.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Score Badge */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            padding: '6px 12px',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: 'inset 0 1px 2px rgba(251, 146, 60, 0.2)',
            fontWeight: 800,
            fontSize: '0.95rem',
            color: '#b45309',
            border: '1px solid #fcd34d'
          }}>
            ⭐ {score}
          </div>

          {/* Edit Mode Gear Icon */}
          <button
            onClick={openEditor}
            style={{
              background: '#ffffff',
              border: '1px solid #fed7aa',
              color: '#ea580c',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'rotate(45deg)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg)'}
            title="Edit Puzzles"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </header>

      {/* --- 2x2 IMAGE GRID --- */}
      <main className="glass-panel" style={{
        borderRadius: '24px',
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid rgba(255, 255, 255, 0.7)'
      }}>
        {activePuzzle.images.map((src, index) => (
          <div
            key={index}
            onClick={() => setLightboxImg(src)}
            style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              cursor: 'zoom-in',
              position: 'relative',
              backgroundColor: '#fed7aa',
              border: '2px solid #ffffff',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(124, 45, 18, 0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
            }}
          >
            <img
              src={src}
              alt={`Hint ${index + 1}`}
              onError={(e) => {
                // Fail-safe default placeholder if URL is invalid
                e.currentTarget.src = `https://picsum.photos/seed/placeholder-${index}/300/300`;
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            {/* Soft inner glow */}
            <div style={{
              position: 'absolute',
              inset: 0,
              boxShadow: 'inset 0 0 12px rgba(0,0,0,0.08)',
              pointerEvents: 'none'
            }} />
          </div>
        ))}
      </main>

      {/* --- GUESSED LETTERS SLOTS --- */}
      <section
        className={shake ? 'animate-shake' : ''}
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '28px',
          flexWrap: 'wrap'
        }}
      >
        {guesses.map((guess, idx) => (
          <div
            key={idx}
            onClick={() => handleGuessClick(guess, idx)}
            className={`letter-tile ${guess ? 'filled animate-pop' : 'empty'}`}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              textTransform: 'uppercase',
              fontSize: '1.2rem',
              fontWeight: 800,
              boxShadow: guess ? '0 4px 0px #b45309' : 'none',
              border: shake ? '2px solid #ef4444' : guess ? '2px solid #ea580c' : '2px dashed #fed7aa',
              transition: 'border-color 0.2s, background-color 0.2s'
            }}
          >
            {guess ? guess.letter : ''}
          </div>
        ))}
      </section>

      {/* --- POWERUPS BAR --- */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {/* Reveal A Letter */}
        <button
          onClick={handleRevealLetter}
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.75)',
            border: '1px solid #fcd34d',
            borderRadius: '12px',
            padding: '8px',
            color: '#b45309',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fffbeb'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.75)'}
        >
          🔍 Reveal (-15⭐)
        </button>

        {/* Skip Level */}
        <button
          onClick={handleSkipLevel}
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.75)',
            border: '1px solid #fcd34d',
            borderRadius: '12px',
            padding: '8px',
            color: '#b45309',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fffbeb'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.75)'}
        >
          ⏩ Skip Round (-30⭐)
        </button>
      </div>

      {/* --- SCRAMBLED LETTERS TILE POOL --- */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '8px',
        marginBottom: '20px'
      }}>
        {letterPool.map((tile) => (
          <button
            key={tile.id}
            onClick={() => handleTileClick(tile)}
            disabled={tile.isUsed}
            className="letter-tile"
            style={{
              aspectRatio: '1',
              width: '100%',
              fontSize: '1.25rem',
              fontWeight: 800,
              visibility: tile.isUsed ? 'hidden' : 'visible',
              opacity: tile.isUsed ? 0 : 1,
              transition: 'opacity 0.15s, visibility 0.15s'
            }}
          >
            {tile.letter}
          </button>
        ))}
      </section>

      {/* --- SUCCESS MODAL OVERLAY --- */}
      {isSuccess && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(67, 20, 7, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          padding: '24px'
        }}>
          {renderConfetti()}
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '380px',
            borderRadius: '24px',
            padding: '32px 24px',
            textAlign: 'center',
            border: '2px solid #fbbf24',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            transform: 'scale(1)',
            animation: 'pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
          }}>
            <span style={{ fontSize: '3rem' }} className="animate-bounce-slow">🏆</span>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
              marginTop: '12px'
            }}>
              CORRECT!
            </h2>
            <p style={{
              color: '#7c2d12',
              fontSize: '1.1rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              marginBottom: '20px'
            }}>
              THE ANSWER WAS: <span style={{ color: '#ea580c', fontWeight: 800 }}>{activePuzzle.answer}</span>
            </p>
            <div style={{
              background: '#fef3c7',
              borderRadius: '16px',
              padding: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              color: '#b45309',
              marginBottom: '28px',
              border: '1px solid #fcd34d'
            }}>
              💰 BONUS: <span style={{ fontWeight: 950 }}>+10 ⭐</span>
            </div>

            <button
              onClick={handleNextLevel}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '16px',
                padding: '16px',
                fontSize: '1.15rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 0px #b45309',
                transition: 'transform 0.1s'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'translateY(3px)'}
              onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              NEXT LEVEL 🚀
            </button>
          </div>
        </div>
      )}

      {/* --- IMAGE ZOOM LIGHTBOX --- */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 110,
            cursor: 'zoom-out',
            padding: '16px'
          }}
        >
          <div style={{
            position: 'relative',
            maxWidth: '100%',
            maxHeight: '80vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img
              src={lightboxImg}
              alt="Zoomed hint"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '4px solid #ffffff'
              }}
            />
            {/* Close Button */}
            <button
              onClick={() => setLightboxImg(null)}
              style={{
                position: 'absolute',
                top: '-48px',
                right: '0',
                background: '#ffffff',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#000000',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* --- EDIT MODE MODAL/DRAWER (FULL SCREEN OVERLAY) --- */}
      {editMode && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(67, 20, 7, 0.5)',
          backdropFilter: 'blur(8px)',
          zIndex: 120,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflowY: 'auto',
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '480px',
            borderRadius: '24px',
            padding: '24px 20px',
            border: '2px solid #fdba74',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            marginTop: '20px',
            marginBottom: '40px',
            maxHeight: 'calc(100vh - 80px)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid #fed7aa',
              paddingBottom: '14px',
              marginBottom: '16px'
            }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7c2d12' }}>
                  ⚙️ Puzzle Editor
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '2px' }}>
                  Manage puzzles & custom URLs
                </p>
              </div>
              <button
                onClick={() => setEditMode(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#7c2d12',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Scrollable list */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              paddingRight: '6px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {editorPuzzles.map((puz, puzIdx) => (
                <div key={puz.id} style={{
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid #fed7aa',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontWeight: 800, color: '#ea580c', fontSize: '0.9rem' }}>
                      ROUND {puzIdx + 1}
                    </span>
                    <button
                      onClick={() => handleDeletePuzzle(puzIdx)}
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fee2e2',
                        color: '#ef4444',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>

                  {/* Answer Input */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#7c2d12',
                      marginBottom: '4px'
                    }}>
                      ANSWER WORD:
                    </label>
                    <input
                      type="text"
                      value={puz.answer}
                      onChange={(e) => updateEditorPuzzleWord(puzIdx, e.target.value)}
                      placeholder="e.g. SUN"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#1e293b',
                        textTransform: 'uppercase'
                      }}
                    />
                  </div>

                  {/* 4 Image URL Inputs with mini preview next to each */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#7c2d12',
                      marginBottom: '6px'
                    }}>
                      IMAGE URLS (4 REQUIRED):
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {puz.images.map((imgUrl, imgIdx) => (
                        <div key={imgIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {/* Mini Preview */}
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            backgroundColor: '#e2e8f0',
                            border: '1px solid #cbd5e1',
                            flexShrink: 0
                          }}>
                            <img
                              src={imgUrl}
                              alt="Mini preview"
                              onError={(e) => {
                                e.currentTarget.src = `https://picsum.photos/seed/error-${imgIdx}/100/100`;
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          {/* Input */}
                          <input
                            type="text"
                            value={imgUrl}
                            onChange={(e) => updateEditorPuzzleImg(puzIdx, imgIdx, e.target.value)}
                            placeholder={`Image URL #${imgIdx + 1}`}
                            style={{
                              flex: 1,
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.75rem',
                              color: '#334155'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              borderTop: '2px solid #fed7aa',
              paddingTop: '14px'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Add New Puzzle */}
                <button
                  onClick={handleAddNewPuzzle}
                  style={{
                    flex: 1,
                    background: '#fffbeb',
                    border: '1px dashed #ea580c',
                    color: '#ea580c',
                    padding: '10px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  ➕ Add New Round
                </button>

                {/* Reset to Defaults */}
                <button
                  onClick={handleResetToDefaults}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                  title="Reset Game"
                >
                  🔄 Reset Defaults
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={() => setEditMode(false)}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    border: 'none',
                    color: '#475569',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditor}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    boxShadow: '0 4px 0px #b45309',
                    cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FOOTER CREDIT --- */}
      <footer style={{
        textAlign: 'center',
        marginTop: 'auto',
        paddingTop: '20px',
        fontSize: '0.75rem',
        color: '#b45309',
        fontWeight: 500
      }}>
        Made with 🧡 • tap images to zoom
      </footer>
    </div>
  );
}
