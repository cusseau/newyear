"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// --- Définitions (inchangées) ---
interface Cat {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isOnFire: boolean;
}
type GameState = "playing" | "won" | "lost";

const createCat = (id: number): Cat => ({
  id: id,
  x: Math.random() * 90,
  y: Math.random() * 90,
  vx: (Math.random() - 0.5) * 2,
  vy: (Math.random() - 0.5) * 2,
  isOnFire: true,
});

// --- Objets de style (pour remplacer Tailwind) ---
const styles = {
  main: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#111827', // Fond sombre
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
  winTitle: {
    fontSize: '3.75rem',
    fontWeight: 'bold',
    color: '#34D399', // Vert
    marginBottom: '1rem',
  },
  winText: {
    fontSize: '1.875rem',
  },
  winTime: {
    fontSize: '2.25rem',
    color: '#FDE047', // Jaune
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
    color: '#DC2626', // Rouge
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
    zIndex: 30, // Flash par-dessus tout
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
    fontSize: '4.5rem', // text-7xl
  }
} as const; // <-- LA CORRECTION EST ICI. On dit à TS que c'est constant.


// --- Composant Principal ---
export default function Home() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [gameState, setGameState] = useState<GameState>("playing");

  // --- Toute la logique du jeu (inchangée) ---
  useEffect(() => {
    const initialCats = [createCat(1), createCat(2), createCat(3), createCat(4), createCat(5)];
    setCats(initialCats);
  }, []);

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
  // --- Fin de la logique ---

  return (
    <>
      {/* On a besoin de cette balise <style> pour l'animation flash */}
      <style>
        {`
          @keyframes flash {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
          .animate-flash {
            animation: flash 0.5s ease-out forwards;
          }
        `}
      </style>

      {/* On utilise nos objets de style ici */}
      <main style={styles.main}>
        {/* Écran de victoire (inchangé) */}
        {gameState === "won" && (
          <div style={styles.overlay}>
            <h1 style={styles.winTitle}>BRAVO !</h1>
            <p style={styles.winText}>Tu as éteint tous les chats en</p>
            <p style={styles.winTime}>{(time / 10).toFixed(1)} secondes</p>
          </div>
        )}

        {/* Écran de défaite (Game Over) (inchangé) */}
        {gameState === "lost" && (
          <div style={styles.loseOverlay}>
            <Image
              src="/images/burnt-cat.png"
              alt="Chat cramé"
              fill
              style={{ 
                objectFit: 'contain',
                zIndex: 10,
              }}
            />
            <div style={styles.flash} className="animate-flash" />
            <div style={{ zIndex: 20, textAlign: 'center', position: 'relative' }}>
              <h1 style={styles.loseTitle}>GAME OVER</h1>
              <p style={styles.loseText}>"Ça a... cramé..."</p>
            </div>
          </div>
        )}
        
        {/* Le jeu (ne s'affiche que si on est en train de jouer) */}
        {gameState === "playing" && (
          <>
            {/* Affichage du score */}
            <div style={{ ...styles.hud, left: '1rem' }}>
              🔥 Chats éteints : {score} / 5
            </div>

            {/* Affichage du minuteur */}
            <div style={{ 
                ...styles.hud, 
                right: '1rem', 
                color: time > 500 ? '#EF4444' : 'white'
              }}>
              ⏱️ Temps : {(time / 10).toFixed(1)}
            </div>

            {/* On affiche chaque chat */}
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
                  <Image
                    src="/images/cat-on-fire.png"
                    alt="Chat avec le feu au cul"
                    width={120}
                    height={120}
                    style={{ objectFit: 'contain' }}
                  />
                ) : (
                  <span style={styles.catNormal}>😺</span>
                )}
              </div>
            ))}
          </>
        )}
      </main>
    </>
  );
}