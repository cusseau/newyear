"use client";

import { useState, useEffect, useRef } from "react";
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
// NOUVEL ÉTAT "IDLE"
type GameState = "idle" | "playing" | "won" | "lost";

const createCat = (id: number): Cat => ({
  id: id,
  x: Math.random() * 90,
  y: Math.random() * 90,
  vx: (Math.random() - 0.5) * 2,
  vy: (Math.random() - 0.5) * 2,
  isOnFire: true,
});

// --- Objets de style (AJOUT de boutons) ---
const styles = {
  main: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#111827',
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
  // Style pour le bouton "Commencer"
  startButton: {
    fontSize: '2.25rem',
    fontWeight: 'bold',
    color: 'black',
    backgroundColor: '#FDE047', // Jaune
    padding: '1rem 2rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    border: 'none',
  },
  // Style pour le bouton "Recommencer"
  restartButton: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'black',
    backgroundColor: '#34D399', // Vert
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    border: 'none',
    marginTop: '2rem',
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


// --- Composant Principal ---
export default function Home() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  // Le jeu commence en attente
  const [gameState, setGameState] = useState<GameState>("idle");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Fonctions de jeu ---

  // Crée les chats et réinitialise les scores/temps
  const initializeGame = () => {
    setScore(0);
    setTime(0);
    const initialCats = [
      createCat(1),
      createCat(2),
      createCat(3),
      createCat(4),
      createCat(5),
    ];
    setCats(initialCats);
  };

  // Appelé par le bouton "Commencer"
  const startGame = () => {
    initializeGame(); // Prépare le jeu
    setGameState("playing"); // Démarre le jeu

    // Crée et lance la musique
    if (!audioRef.current) {
      audioRef.current = new Audio("/ambiancesong.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
    audioRef.current.currentTime = 13;
    audioRef.current.play().catch(e => console.error("Autoplay bloqué: ", e));
  };

  // Appelé par les boutons "Recommencer"
  const restartGame = () => {
    initializeGame(); // Prépare le jeu
    setGameState("playing"); // Démarre le jeu

    // Relance la musique au bon endroit
    if (audioRef.current) {
      audioRef.current.currentTime = 13;
      audioRef.current.play().catch(e => console.error("Autoplay bloqué: ", e));
    }
  };

  // --- Hooks (Logique de jeu) ---

  // Minuteur du jeu
  useEffect(() => {
    if (gameState !== "playing") return; // Ne s'active que si le jeu est en cours
    const timerId = setInterval(() => {
      setTime((t) => {
        const newTime = t + 1;
        if (newTime >= 100) { // 10 secondes
          setGameState("lost");
          clearInterval(timerId);
          return 100;
        }
        return newTime;
      });
    }, 100);
    return () => clearInterval(timerId);
  }, [gameState]); // Dépend de gameState

  // Boucle de mouvement des chats
  useEffect(() => {
    if (gameState !== "playing") return; // Ne s'active que si le jeu est en cours
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
  }, [gameState]); // Dépend de gameState

  // Vérification de la victoire
  useEffect(() => {
    if (cats.length === 0 || gameState !== "playing") return;
    const stillOnFire = cats.some((cat) => cat.isOnFire);
    if (!stillOnFire) {
      setGameState("won");
    }
  }, [cats, gameState]);

  // Nettoyage de la musique
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Clic sur un chat
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

  // --- Rendu JSX ---
  return (
    <>
      <style>
        {`
          @keyframes flash {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
          .animate-flash {
            animation: flash 0.5s ease-out forwards;
          }
          /* Petite animation pour le bouton start */
          .hover-scale:hover {
            transform: scale(1.05);
          }
        `}
      </style>

      <main style={styles.main}>

        {/* NOUVEAU: Écran d'accueil */}
        {gameState === "idle" && (
          <div style={styles.overlay}>
            <h1 style={{...styles.winTitle, fontSize: '5rem'}}>Sauve les Chats !</h1>
            <p style={styles.winText}>Éteins le feu avant la fin du temps imparti.</p>
            <button 
              onClick={startGame} 
              style={{...styles.startButton, marginTop: '2rem'}}
              className="hover-scale"
            >
              COMMENCER
            </button>
          </div>
        )}

        {/* Écran de victoire (AJOUT d'un bouton) */}
        {gameState === "won" && (
          <div style={styles.overlay}>
            <h1 style={styles.winTitle}>BRAVO !</h1>
            <p style={styles.winText}>Tu as éteint tous les chats en</p>
            <p style={styles.winTime}>{(time / 10).toFixed(1)} secondes</p>
            <button onClick={restartGame} style={styles.restartButton} className="hover-scale">
              Recommencer
            </button>
          </div>
        )}

        {/* Écran de défaite (AJOUT d'un bouton) */}
        {gameState === "lost" && (
          <div style={styles.loseOverlay}>
            <Image
              src="/images/deadcat.jpg"
              alt="Chat cramé"
              fill
              style={{ objectFit: 'contain', zIndex: 10 }}
            />
            <div style={styles.flash} className="animate-flash" />
            <div style={{ zIndex: 20, textAlign: 'center', position: 'relative' }}>
              <h1 style={styles.loseTitle}>GAME OVER</h1>
              <p style={styles.loseText}>"Ça a... cramé..."</p>
              <button onClick={restartGame} style={styles.restartButton} className="hover-scale">
                Recommencer
              </button>
            </div>
          </div>
        )}
        
        {/* Le jeu (ne s'affiche que si on est en train de jouer) */}
        {gameState === "playing" && (
          <>
            <div style={{ ...styles.hud, left: '1rem' }}>
              🔥 Chats éteints : {score} / 5
            </div>
            <div style={{ 
                ...styles.hud, 
                right: '1rem', 
                color: time > 500 ? '#EF4444' : 'white'
              }}>
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
                  <Image
                    src="/images/firecat.png"
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