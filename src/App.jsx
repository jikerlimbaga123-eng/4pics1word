import React, { useState, useEffect, useRef } from 'react';

// Starter built-in puzzles using high-quality Unsplash image URLs
const DEFAULT_PUZZLES = [
  {
    id: 'puzzle-1',
    answer: 'MASARAP',
    images: [
      'https://cdn-icons-png.flaticon.com/512/9154/9154733.png',
      'https://i.imgur.com/vilgHgN.jpeg',
      'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d89607fd-aaa9-4ac9-aa6b-f79bb59f9177/d5du4y2-b6f94767-4a4b-4352-9631-36653a78d0a4.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi9kODk2MDdmZC1hYWE5LTRhYzktYWE2Yi1mNzliYjU5ZjkxNzcvZDVkdTR5Mi1iNmY5NDc2Ny00YTRiLTQzNTItOTYzMS0zNjY1M2E3OGQwYTQuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.PP7AffY9tKeEOZDDfne4jbDtFeiBLzC1RB9VtzBuakY',
      'https://www.aroundtheworldl.com/wp-content/uploads/2010/12/IMG_9473.jpeg'
    ]
  },
  {
    id: 'puzzle-2',
    answer: 'BINIBINI',
    images: [
      'https://dthezntil550i.cloudfront.net/fs/latest/fs2403292106483760019770723/1280_960/47975964-58d7-4b11-b732-bd81dd78c89b.png',
      'https://i.imgur.com/bWb1uJ1.jpeg',
      'https://img.pikbest.com/png-images/20250202/emoji-character-smiling-face-large-blue-eyes-holding-tulip-bouquet-colorful-tulips_11478091.png!bw700',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop'
    ]
  },
  {
    id: 'puzzle-3',
    answer: 'ANGCUTENIYO',
    images: [
      'https://images.stockcake.com/public/f/5/1/f511e8a2-6416-4a20-839f-844a6d43c4c2_large/kawaii-happy-emoji-stockcake.jpg',
      'https://i.imgur.com/J6sqSx7.jpeg',
      'https://i.imgur.com/JkRLO4j.jpeg',
      'https://miro.medium.com/v2/0*A7MUqyCLvZDcHkfM.jpg'
    ]
  },
  {
    id: 'puzzle-4',
    answer: 'GORGEOUS',
    images: [
      'https://i.imgur.com/euQyxIW.jpeg',
      'https://i.imgur.com/nzorYhB.jpeg',
      'https://i.imgur.com/UatMp2O.jpeg',
      'https://i.imgur.com/Q3B2niY.jpeg'
    ]
  },
  {
    id: 'puzzle-5',
    answer: 'WAGKANASIGIPANGAWAY',
    images: [
      'https://ih1.redbubble.net/image.4760278052.7783/bg,f8f8f8-flat,750x,075,f-pad,750x1000,f8f8f8.webp',
      'https://i.imgur.com/TvZ88hv.jpeg',
      'https://media.tenor.com/zkvh5c3BkKoAAAAM/cute-adorable.gif',
      'https://i.imgur.com/1l9deFR.jpeg'
    ]
  }
];

export default function App() {
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

  const activePuzzle = puzzles[currentIdx] || puzzles[0] || DEFAULT_PUZZLES[0];

  const [guesses, setGuesses] = useState([]);
  const [letterPool, setLetterPool] = useState([]);
  const [shake, setShake] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editorPuzzles, setEditorPuzzles] = useState([]);

  // Use a ref to track active puzzle id to avoid stale closure issues
  const activePuzzleIdRef = useRef(activePuzzle.id);
  const shakeTimerRef = useRef(null);

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

    // Clear any pending shake timer from previous puzzle
    if (shakeTimerRef.current) {
      clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = null;
    }

    // Update the ref so validation effect knows which puzzle is active
    activePuzzleIdRef.current = activePuzzle.id;

    // Reset all states cleanly
    setShake(false);
    setIsSuccess(false);
    setGuesses(Array(activePuzzle.answer.length).fill(null));

    const answerChars = activePuzzle.answer.toUpperCase().split('');
    const extraChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const totalLetters = [...answerChars];

    while (totalLetters.length < 12) {
      const randChar = extraChars[Math.floor(Math.random() * extraChars.length)];
      totalLetters.push(randChar);
    }

    const scrambled = totalLetters
      .map((char, index) => ({ id: index, letter: char, isUsed: false }))
      .sort(() => Math.random() - 0.5);

    setLetterPool(scrambled);
  }, [currentIdx, puzzles]);

  // --- AUTO ANSWER VALIDATION ---
  useEffect(() => {
    // Guard: only validate for the currently loaded puzzle
    if (activePuzzleIdRef.current !== activePuzzle.id) return;
    if (guesses.length === 0 || guesses.includes(null) || isSuccess) return;

    const currentWord = guesses.map(g => g.letter).join('');
    const solution = activePuzzle.answer.toUpperCase();

    if (currentWord === solution) {
      setIsSuccess(true);
      setScore(prev => prev + 10);
    } else {
      setShake(true);
      const puzzleIdAtStart = activePuzzle.id;
      shakeTimerRef.current = setTimeout(() => {
        // Only reset if we're still on the same puzzle
        if (activePuzzleIdRef.current === puzzleIdAtStart) {
          setShake(false);
          setGuesses(Array(activePuzzle.answer.length).fill(null));
          setLetterPool(prev => prev.map(tile => ({ ...tile, isUsed: false })));
        }
        shakeTimerRef.current = null;
      }, 700);
    }
  }, [guesses]);

  const handleTileClick = (tile) => {
    if (tile.isUsed || isSuccess || shake) return;
    const emptyIdx = guesses.findIndex(g => g === null);
    if (emptyIdx === -1) return;
    const updatedGuesses = [...guesses];
    updatedGuesses[emptyIdx] = { poolId: tile.id, letter: tile.letter };
    setGuesses(updatedGuesses);
    setLetterPool(prev => prev.map(t => (t.id === tile.id ? { ...t, isUsed: true } : t)));
  };

  const handleGuessClick = (guessItem, idx) => {
    if (!guessItem || isSuccess || shake) return;
    const updatedGuesses = [...guesses];
    updatedGuesses[idx] = null;
    setGuesses(updatedGuesses);
    setLetterPool(prev =>
      prev.map(t => (t.id === guessItem.poolId ? { ...t, isUsed: false } : t))
    );
  };

  const handleNextLevel = () => {
    setIsSuccess(false);
    if (currentIdx < puzzles.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
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
    const poolTile = letterPool.find(t => t.letter === targetChar && !t.isUsed);
    if (poolTile) {
      setScore(prev => prev - 15);
      const updatedGuesses = [...guesses];
      updatedGuesses[emptyIdx] = { poolId: poolTile.id, letter: poolTile.letter };
      setGuesses(updatedGuesses);
      setLetterPool(prev => prev.map(t => (t.id === poolTile.id ? { ...t, isUsed: true } : t)));
    } else {
      alert("No available tiles to reveal this letter! Try clearing some tiles first.");
    }
  };

  const openEditor = () => {
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

  const renderConfetti = () => {
    const colors = ['#f59e0b', '#f97316', '#fbbf24', '#f43f5e', '#10b981', '#3b82f6'];
    return (
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 50 }}>
        {Array.from({ length: 40 }).map((_, i) => {
          const color = colors[Math.floor(Math.random() * colors.length)];
          const size = Math.random() * 8 + 6;
          const left = Math.random() * 100;
          const delay = Math.random() * 1.5;
          const duration = Math.random() * 2 + 2;
          return (
            <div key={i} style={{ position: 'absolute', width: `${size}px`, height: `${size}px`, backgroundColor: color, borderRadius: Math.random() > 0.5 ? '50%' : '20%', top: '-10px', left: `${left}%`, opacity: 0.8, transform: `rotate(${Math.random() * 360}deg)`, animation: `fall ${duration}s linear ${delay}s infinite` }} />
          );
        })}
        <style dangerouslySetInnerHTML={{__html: `@keyframes fall { 0% { transform: translateY(-10px) rotate(0deg); opacity: 1; } 100% { transform: translateY(600px) rotate(360deg); opacity: 0; } }`}} />
      </div>
    );
  };

  return (
    <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', padding: '16px 12px 24px 12px' }}>

      <header className="glass-panel" style={{ borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7c2d12', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🖼️ 4 Pics 1 Word
          </h1>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309', marginTop: '2px' }}>
            ROUND {currentIdx + 1} OF {puzzles.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', padding: '6px 12px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, fontSize: '0.95rem', color: '#b45309', border: '1px solid #fcd34d' }}>
            ⭐ {score}
          </div>
          <button onClick={openEditor} style={{ background: '#ffffff', border: '1px solid #fed7aa', color: '#ea580c', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'rotate(45deg)'} onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg)'} title="Edit Puzzles">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </header>

      <main className="glass-panel" style={{ borderRadius: '24px', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px', boxShadow: 'var(--shadow-md)', border: '1px solid rgba(255, 255, 255, 0.7)' }}>
        {activePuzzle.images.map((src, index) => (
          <div key={index} onClick={() => setLightboxImg(src)} style={{ width: '100%', aspectRatio: '1', borderRadius: '16px', overflow: 'hidden', cursor: 'zoom-in', position: 'relative', backgroundColor: '#fed7aa', border: '2px solid #ffffff', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
            <img src={src} alt={`Hint ${index + 1}`} onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/placeholder-${index}/300/300`; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </main>

      <section className={shake ? 'animate-shake' : ''} style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {guesses.map((guess, idx) => (
          <div key={idx} onClick={() => handleGuessClick(guess, idx)} className={`letter-tile ${guess ? 'filled animate-pop' : 'empty'}`} style={{ width: '42px', height: '42px', borderRadius: '10px', textTransform: 'uppercase', fontSize: '1.2rem', fontWeight: 800, boxShadow: guess ? '0 4px 0px #b45309' : 'none', border: shake ? '2px solid #ef4444' : guess ? '2px solid #ea580c' : '2px dashed #fed7aa', transition: 'border-color 0.2s, background-color 0.2s' }}>
            {guess ? guess.letter : ''}
          </div>
        ))}
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '20px' }}>
        <button onClick={handleRevealLetter} style={{ flex: 1, background: 'rgba(255, 255, 255, 0.75)', border: '1px solid #fcd34d', borderRadius: '12px', padding: '8px', color: '#b45309', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          🔍 Reveal (-15⭐)
        </button>
        <button onClick={handleSkipLevel} style={{ flex: 1, background: 'rgba(255, 255, 255, 0.75)', border: '1px solid #fcd34d', borderRadius: '12px', padding: '8px', color: '#b45309', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          ⏩ Skip Round (-30⭐)
        </button>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '20px' }}>
        {letterPool.map((tile) => (
          <button key={tile.id} onClick={() => handleTileClick(tile)} disabled={tile.isUsed} className="letter-tile" style={{ aspectRatio: '1', width: '100%', fontSize: '1.25rem', fontWeight: 800, visibility: tile.isUsed ? 'hidden' : 'visible', opacity: tile.isUsed ? 0 : 1, transition: 'opacity 0.15s, visibility 0.15s' }}>
            {tile.letter}
          </button>
        ))}
      </section>

      {isSuccess && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(67, 20, 7, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '24px' }}>
          {renderConfetti()}
          <div className="glass-panel" style={{ width: '100%', maxWidth: '380px', borderRadius: '24px', padding: '32px 24px', textAlign: 'center', border: '2px solid #fbbf24', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <span style={{ fontSize: '3rem' }}>🏆</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px', marginTop: '12px' }}>CORRECT!</h2>
            <p style={{ color: '#7c2d12', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '20px' }}>
              THE ANSWER WAS: <span style={{ color: '#ea580c', fontWeight: 800 }}>{activePuzzle.answer}</span>
            </p>
            <div style={{ background: '#fef3c7', borderRadius: '16px', padding: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#b45309', marginBottom: '28px', border: '1px solid #fcd34d' }}>
              💰 BONUS: <span style={{ fontWeight: 950 }}>+10 ⭐</span>
            </div>
            <button onClick={handleNextLevel} style={{ width: '100%', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', color: '#ffffff', border: 'none', borderRadius: '16px', padding: '16px', fontSize: '1.15rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 0px #b45309' }}>
              NEXT LEVEL 🚀
            </button>
          </div>
        </div>
      )}

      {lightboxImg && (
        <div onClick={() => setLightboxImg(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 110, cursor: 'zoom-out', padding: '16px' }}>
          <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '80vh' }}>
            <img src={lightboxImg} alt="Zoomed hint" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '16px', border: '4px solid #ffffff' }} />
            <button onClick={() => setLightboxImg(null)} style={{ position: 'absolute', top: '-48px', right: '0', background: '#ffffff', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', color: '#000000' }}>✕</button>
          </div>
        </div>
      )}

      {editMode && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(67, 20, 7, 0.5)', backdropFilter: 'blur(8px)', zIndex: 120, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflowY: 'auto', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', borderRadius: '24px', padding: '24px 20px', border: '2px solid #fdba74', marginTop: '20px', marginBottom: '40px', maxHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #fed7aa', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7c2d12' }}>⚙️ Puzzle Editor</h2>
                <p style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '2px' }}>Manage puzzles & custom URLs</p>
              </div>
              <button onClick={() => setEditMode(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#7c2d12' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {editorPuzzles.map((puz, puzIdx) => (
                <div key={puz.id} style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '16px', padding: '16px', border: '1px solid #fed7aa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 800, color: '#ea580c', fontSize: '0.9rem' }}>ROUND {puzIdx + 1}</span>
                    <button onClick={() => handleDeletePuzzle(puzIdx)} style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>🗑️ Delete</button>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#7c2d12', marginBottom: '4px' }}>ANSWER WORD:</label>
                    <input type="text" value={puz.answer} onChange={(e) => updateEditorPuzzleWord(puzIdx, e.target.value)} placeholder="e.g. SUN" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#7c2d12', marginBottom: '6px' }}>IMAGE URLS (4 REQUIRED):</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {puz.images.map((imgUrl, imgIdx) => (
                        <div key={imgIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1', flexShrink: 0 }}>
                            <img src={imgUrl} alt="Mini preview" onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/error-${imgIdx}/100/100`; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <input type="text" value={imgUrl} onChange={(e) => updateEditorPuzzleImg(puzIdx, imgIdx, e.target.value)} placeholder={`Image URL #${imgIdx + 1}`} style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.75rem', color: '#334155' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '2px solid #fed7aa', paddingTop: '14px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleAddNewPuzzle} style={{ flex: 1, background: '#fffbeb', border: '1px dashed #ea580c', color: '#ea580c', padding: '10px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>➕ Add New Round</button>
                <button onClick={handleResetToDefaults} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', padding: '10px 14px', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>🔄 Reset Defaults</button>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button onClick={() => setEditMode(false)} style={{ flex: 1, background: '#f1f5f9', border: 'none', color: '#475569', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveEditor} style={{ flex: 1, background: 'linear-gradient(135deg, #f59e0b, #ea580c)', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, boxShadow: '0 4px 0px #b45309', cursor: 'pointer' }}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '20px', fontSize: '0.75rem', color: '#b45309', fontWeight: 500 }}>
        Made with 🧡 • tap images to zoom
      </footer>
    </div>
  );
}
