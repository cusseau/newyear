"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// --- Définitions ---
interface FallingItem {
  id: number;
  x: number;
  y: number;
  speed: number;
  type: 'cat' | 'mouse';
}
type GameState = "idle" | "playing" | "lost";

interface CatcherGameProps {
  goBackToMenu: () => void;
  playMusic: () => void;
}

const LIVES_START = 5;
const BASKET_WIDTH = 120;
const ITEM_WIDTH = 80;
const BASKET_SPEED = 2.5;

// --- Styles pour CE jeu ---
const styles = {
  // NOUVEAU: On ajoute ce style pour remplacer "styles.main"
  gameArea: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
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
  title: {
    fontSize: '3.75rem',
    fontWeight: 'bold',
    color: '#60A5FA', // Bleu
    marginBottom: '1rem',
  },
  text: {
    fontSize: '1.875rem',
  },
  loseTitle: {
    fontSize: '6rem',
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: '1rem',
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
  basket: {
    position: 'absolute',
    bottom: '5%',
    fontSize: '120px',
    zIndex: 15,
    transform: 'translateX(-50%)',
  },
  fallingItem: {
    position: 'absolute',
    zIndex: 12,
    transition: 'top 0.1s linear',
  }
} as const;


// --- Composant Jeu "Chat-Catcher" ---
export default function CatcherGame({ goBackToMenu, playMusic }: CatcherGameProps) {
  const [items, setItems] = useState<FallingItem[]>([]);
  const [basketX, setBasketX] = useState(50); 
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES_START);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null); // Référence à la zone de jeu

  // (Toute la logique de jeu reste identique)
  const initializeGame = () => {
    setScore(0);
    setLives(LIVES_START);
    setItems([]);
    setBasketX(50);
  };

  const startGame = () => {
    initializeGame();
    setGameState("playing");
    playMusic();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setMoveLeft(true);
      if (e.key === 'ArrowRight') setMoveRight(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setMoveLeft(false);
      if (e.key === 'ArrowRight') setMoveRight(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;

    const gameLoop = setInterval(() => {
      setBasketX((currentX) => {
        let newX = currentX;
        if (moveLeft) newX -= BASKET_SPEED;
        if (moveRight) newX += BASKET_SPEED;
        
        const basketWidthPercent = (BASKET_WIDTH / window.innerWidth) * 100;
        if (newX < basketWidthPercent / 2) newX = basketWidthPercent / 2;
        if (newX > 100 - basketWidthPercent / 2) newX = 100 - basketWidthPercent / 2;
        
        return newX;
      });

      setItems((currentItems) => {
        let newLives = lives;
        let newScore = score;

        const updatedItems = currentItems.map(item => {
          const newY = item.y + item.speed;
          
          if (newY > 90) {
            const basketLeft = basketX - (BASKET_WIDTH / window.innerWidth * 100) / 2;
            const basketRight = basketX + (BASKET_WIDTH / window.innerWidth * 100) / 2;
            
            if (item.x > basketLeft && item.x < basketRight) {
              if (item.type === 'cat') {
                newScore += 10;
              } else {
                newScore -= 5;
              }
            } else {
              if (item.type === 'cat') {
                newLives--;
              }
            }
            return null;
          }
          
          return { ...item, y: newY };
        }).filter(Boolean) as FallingItem[];

        setScore(newScore);
        setLives(newLives);
        
        if (newLives <= 0) {
          setGameState("lost");
        }
        
        return updatedItems;
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameState, lives, score, basketX, moveLeft, moveRight]);
  
  useEffect(() => {
    if (gameState !== "playing") return;

    const spawnLoop = setInterval(() => {
      const itemType: 'cat' | 'mouse' = Math.random() > 0.3 ? 'cat' : 'mouse';
      setItems((currentItems) => [
        ...currentItems,
        {
          id: Date.now(),
          x: Math.random() * 90 + 5,
          y: -10,
          speed: 1 + Math.random() * 1.5,
          type: itemType,
        }
      ]);
    }, 2200);

    return () => clearInterval(spawnLoop);
  }, [gameState]);


  // --- Rendu JSX du jeu ---
  return (
    // MODIFIÉ: On utilise styles.gameArea au lieu de styles.main
    <div 
      ref={gameAreaRef} 
      style={{
        ...styles.gameArea, 
        cursor: gameState === 'playing' ? 'none' : 'auto'
      }}
    > 
    
      {/* Écran d'accueil */}
      {gameState === "idle" && (
        <div style={styles.overlay}>
          <h1 style={styles.title}>Chat-Catcher 🧺</h1>
          <p style={styles.text}>Attrape les bébés chats ! Évite les souris !</p>
          <button onClick={startGame} style={{...styles.startButton, marginTop: '2rem'}} className="hover-scale">
            COMMENCER
          </button>
          <button onClick={goBackToMenu} style={styles.menuBackButton} className="hover-scale">
            Retour au Menu
          </button>
        </div>
      )}

      {/* Écran de défaite */}
      {gameState === "lost" && (
        <div style={styles.overlay}>
          <h1 style={styles.loseTitle}>GAME OVER</h1>
          <p style={styles.text}>Ton score final : {score} points !</p>
          <button onClick={startGame} style={styles.restartButton} className="hover-scale">
            Recommencer
          </button>
          <button onClick={goBackToMenu} style={styles.menuBackButton} className="hover-scale">
            Retour au Menu
          </button>
        </div>
      )}
      
      {/* Le jeu en cours */}
      {gameState === "playing" && (
        <>
          <div style={{ ...styles.hud, left: '1rem' }}>
            🐱 Score : {score}
          </div>
          <div style={{ ...styles.hud, right: '1rem', color: lives <= 1 ? '#EF4444' : 'white' }}>
            ❤️ Vies : {lives}
          </div>
          
          <div style={{ ...styles.basket, left: `${basketX}%` }}>
            🧺
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              style={{
                ...styles.fallingItem,
                left: `calc(${item.x}% - ${ITEM_WIDTH / 2}px)`,
                top: `${item.y}%`,
              }}
            >
              <Image
                src={item.type === 'cat' ? "/images/baby-cat.png" : "/images/evil-mouse.png"}
                alt={item.type === 'cat' ? "Bébé chat" : "Souris méchante"}
                width={ITEM_WIDTH}
                height={ITEM_WIDTH}
                style={{ objectFit: 'contain' }}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
}