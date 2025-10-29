"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// --- Définitions ---
interface Cat {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isOnFire: boolean;
}
type GameState = "idle" | "playing" | "won" | "lost";

// Props que le composant reçoit de la page principale
interface CatOnFireGameProps {
  goBackToMenu: () => void;
  playMusic: () => void;
}

const createCat = (id: number): Cat => ({
  id: id,
  x: Math.random() * 90,
  y: Math.random() * 90,
  vx: (Math.random() - 0.5) * 2,
  vy: (Math.random() - 0.5) * 2,
  isOnFire: true,
});

// --- Styles pour CE jeu ---
const styles = {
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    color: 'white',
    textAlign: 'center',
  },
  startButton: {
    fontSize: '2.25rem',
    fontWeight: 'bold',
    color: 'black',
    backgroundColor: '#FDE047',
    padding: '1rem 2rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    border: 'none',
  },
  restartButton: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'black',
    backgroundColor: '#34D399',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    border: 'none',
    marginTop: '2rem',
  },
  menuBackButton: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#9CA3AF',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    border: 'none',
    marginTop: '1.5rem',
  },
  winTitle: {
    fontSize: '3.75rem',
    fontWeight: 'bold',
    color: '#34D399',
    marginBottom: '1rem',
  },
  winText: {
    fontSize: '1.875rem',
  },
  winTime: {
    fontSize: '2.25rem',
    color: '#FDE047',
    marginTop: '0.5rem',
  },
  loseOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    color: 'white',
    textAlign: 'center',
  },
  loseTitle: {
    fontSize: '6rem',
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: '1rem',
  },
  loseText: {
    fontSize: '2.25rem',
  },
  flash: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'white',
    opacity: 0,
    zIndex: 30,
  },
  hud: {
    position: 'absolute',
    top: '1rem',
    zIndex: 10,
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    padding: '1rem',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '0.5rem',
  },
  catContainer: {
    position: 'absolute',
    cursor: 'pointer',
    userSelect: 'none',
  },
  catNormal: {
    fontSize: '4.5rem',
  }
} as const;


// --- Composant Jeu "Cat on Fire" ---
export default function CatOnFireGame({ goBackToMenu, playMusic }: CatOnFireGameProps) {
  const [cats, setCats] = useState<Cat[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [musicStarted, setMusicStarted] = useState(false);

  const initializeGame = () => {
    setScore(0);
    setTime(0);
    const initialCats = [createCat(1), createCat(2), createCat(3), createCat(4), createCat(5)];
    setCats(initialCats);
  };

  const startGame = () => {
    initializeGame();
    setGameState("playing");
    playMusic(); // On appelle la fonction du parent
    setMusicStarted(true);
  };

  const restartGame = () => {
    initializeGame();
    setGameState("playing");
    playMusic(); // On appelle la fonction du parent
  };

  // Logique du jeu (minuterie, boucle de jeu, etc.)
  useEffect(() => {
    if (gameState !== "playing") return;
    const timerId = setInterval(() => {
      setTime((t) => {
        const newTime = t + 1;
        if (newTime >= 600) {
          setGameState("lost");
          clearInterval(timerId);
          return 600;
        }
        return newTime;
      });
    }, 100);
    return () => clearInterval(timerId);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing") return;
    const gameLoop = setInterval(() => {
      setCats((currentCats) =>
        currentCats.map((cat) => {
          let newX = cat.x + cat.vx;
          let newY = cat.y + cat.vy;
          let newVx = cat.vx;
          let newVy = cat.vy;
          if (newX < 0 || newX > 90) newVx = -newVx;
          if (newY < 0 || newY > 90) newVy = -newVy;
          return { ...cat, x: newX + newVx, y: newY + newVy, vx: newVx, vy: newVy };
        })
      );
    }, 50);
    return () => clearInterval(gameLoop);
  }, [gameState]);

  useEffect(() => {
    if (cats.length === 0 || gameState !== "playing") return;
    const stillOnFire = cats.some((cat) => cat.isOnFire);
    if (!stillOnFire) {
      setGameState("won");
    }
  }, [cats, gameState]);

  const extinguishFire = (catId: number) => {
    if (gameState !== "playing") return;
    
    // Démarre la musique au premier clic si ce n'est pas fait
    if (!musicStarted) {
      playMusic();
      setMusicStarted(true);
    }
    
    const catIsOnFire = cats.find((cat) => cat.id === catId && cat.isOnFire);
    if (catIsOnFire) {
      setScore((s) => s + 1);
      setCats((currentCats) =>
        currentCats.map((cat) => {
          if (cat.id === catId) {
            return { ...cat, isOnFire: false };
          }
          return cat;
        })
      );
    }
  };

  // --- Rendu JSX du jeu ---
  return (
    <>
      {gameState === "idle" && (
        <div style={styles.overlay}>
          <h1 style={{ ...styles.winTitle, fontSize: '5rem' }}>Sauve les Chats !</h1>
          <p style={styles.winText}>Éteins le feu avant la fin du temps imparti.</p>
          <button onClick={startGame} style={{ ...styles.startButton, marginTop: '2rem' }} className="hover-scale">
            COMMENCER
          </button>
          <button onClick={goBackToMenu} style={styles.menuBackButton} className="hover-scale">
            Retour au Menu
          </button>
        </div>
      )}

      {gameState === "won" && (
        <div style={styles.overlay}>
          <h1 style={styles.winTitle}>BRAVO !</h1>
          <p style={styles.winText}>Tu as éteint tous les chats en</p>
          <p style={styles.winTime}>{(time / 10).toFixed(1)} secondes</p>
          <button onClick={restartGame} style={styles.restartButton} className="hover-scale">
            Recommencer
          </button>
          <button onClick={goBackToMenu} style={styles.menuBackButton} className="hover-scale">
            Retour au Menu
          </button>
        </div>
      )}

      {gameState === "lost" && (
        <div style={styles.loseOverlay}>
          <Image src="/images/deadcat.jpg" alt="Chat cramé" fill style={{ objectFit: 'contain', zIndex: 10 }} />
          <div style={styles.flash} className="animate-flash" />
          <div style={{ zIndex: 20, textAlign: 'center', position: 'relative' }}>
            <h1 style={styles.loseTitle}>GAME OVER</h1>
            <p style={styles.loseText}>"Ça a... cramé..."</p>
            <button onClick={restartGame} style={styles.restartButton} className="hover-scale">
              Recommencer
            </button>
            <button onClick={goBackToMenu} style={styles.menuBackButton} className="hover-scale">
              Retour au Menu
            </button>
          </div>
        </div>
      )}

      {gameState === "playing" && (
        <>
          <div style={{ ...styles.hud, left: '1rem' }}>
            🔥 Chats éteints : {score} / 5
          </div>
          <div style={{ ...styles.hud, right: '1rem', color: time > 500 ? '#EF4444' : 'white' }}>
            ⏱️ Temps : {(time / 10).toFixed(1)}
          </div>
          {cats.map((cat) => (
            <div
              key={cat.id}
              style={{
                ...styles.catContainer,
                left: `${cat.x}%`,
                top: `${cat.y}%`,
                transition: "left 0.05s linear, top 0.05s linear",
              }}
              onClick={() => extinguishFire(cat.id)}
            >
              {cat.isOnFire ? (
                <Image src="/images/firecat.png" alt="Chat avec le feu au cul" width={120} height={120} style={{ objectFit: 'contain' }} />
              ) : (
                <span style={styles.catNormal}>😺</span>
              )}
            </div>
          ))}
        </>
      )}
    </>
  );
}