"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image"; // On aura besoin d'images

// --- Définitions ---
interface Coords {
  x: number;
  y: number;
}
type GameState = "idle" | "playing" | "lost";

// Props (inchangées)
interface SnakeGameProps {
  goBackToMenu: () => void;
}

// Constantes de jeu
const GRID_SIZE = 20; // Le jeu se joue sur une grille de 20x20
const GAME_SPEED_MS = 150; // Vitesse du serpent (en ms)
const INITIAL_DIR = { x: 1, y: 0 }; // Commencer en allant à droite

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
    backgroundColor: 'rgba(47, 188, 87, 0.75)',
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
    color: '#34D399', // Vert
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
    left: '1rem',
    zIndex: 10,
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    padding: '1rem',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '0.5rem',
  },
  // La zone de jeu, on va la centrer
  gameArea: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80vmin', // 80% de la plus petite dimension de l'écran
    height: '80vmin',
    backgroundColor: '#2aae47ff', // Fond de grille
    border: '2px solid white',
    boxSizing: 'content-box', // Important pour que la bordure n'affecte pas la taille
  },
  // Style de base pour les objets du jeu
  gameItem: {
    position: 'absolute',
    // On calcule la taille d'une "case"
    width: `calc(100% / ${GRID_SIZE})`,
    height: `calc(100% / ${GRID_SIZE})`,
    fontSize: 'calc(80vmin / 20)', // Taille de l'emoji relative à la grille
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
} as const;


// --- Composant Jeu "Snake-Chat" ---
export default function SnakeGame({ goBackToMenu }: SnakeGameProps) {
  const [snake, setSnake] = useState<Coords[]>([{ x: 10, y: 10 }]);
  const [mouse, setMouse] = useState<Coords>({ x: 15, y: 10 });
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("idle");
  
  // On utilise une Ref pour la direction pour éviter les pbs de "closure"
  const directionRef = useRef<Coords>(INITIAL_DIR);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction pour générer une nouvelle souris
  const generateMouse = (snakeBody: Coords[]) => {
    let newMouse: Coords;
    do {
      newMouse = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // On vérifie qu'elle n'est pas sur le serpent
    } while (snakeBody.some(seg => seg.x === newMouse.x && seg.y === newMouse.y));
    setMouse(newMouse);
  };

  // Fonction pour réinitialiser le jeu
  const initializeGame = () => {
    const startSnake = [{ x: 10, y: 10 }];
    setSnake(startSnake);
    directionRef.current = INITIAL_DIR;
    setScore(0);
    generateMouse(startSnake); // Génère la première souris
  };

  const startGame = () => {
    initializeGame();
    setGameState("playing");
    // Pas de musique pour ce jeu ? (Sinon, ajouter playMusic())
  };

  // 1. Contrôles au clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let newDir: Coords | null = null;
      switch (e.key) {
        case 'ArrowUp':
          newDir = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          newDir = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          newDir = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          newDir = { x: 1, y: 0 };
          break;
      }

      if (newDir) {
        // Empêcher le demi-tour (ex: si on va à droite {1,0}, on ne peut pas aller à gauche {-1,0})
        if (newDir.x !== -directionRef.current.x || newDir.y !== -directionRef.current.y) {
          directionRef.current = newDir;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Se lance une seule fois


  // 2. Boucle de jeu
  useEffect(() => {
    if (gameState !== "playing") {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    gameLoopRef.current = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const dir = directionRef.current;
        const newHead = { x: head.x + dir.x, y: head.y + dir.y };

        // --- Vérification des collisions ---
        // 1. Murs
        if (
          newHead.x < 0 || newHead.x >= GRID_SIZE ||
          newHead.y < 0 || newHead.y >= GRID_SIZE
        ) {
          setGameState("lost");
          return prevSnake;
        }
        // 2. Soi-même
        if (prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          setGameState("lost");
          return prevSnake;
        }

        // --- Mouvement et Croissance ---
        const ateMouse = newHead.x === mouse.x && newHead.y === mouse.y;
        
        // Le nouveau serpent commence par la nouvelle tête
        const newSnake = [newHead, ...prevSnake];

        if (ateMouse) {
          setScore((s) => s + 10);
          generateMouse(newSnake); // Génère une nouvelle souris (en passant le nouveau corps)
          // On ne retire PAS la queue, le serpent grandit
        } else {
          newSnake.pop(); // On retire le dernier segment (la queue)
        }
        
        return newSnake;
      });
    }, GAME_SPEED_MS);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, mouse]); // On a besoin de "mouse" ici pour que la closure `ateMouse` fonctionne

  
  // --- Rendu JSX du jeu ---
  return (
    <>
      {/* Écran d'accueil */}
      {gameState === "idle" && (
        <div style={styles.overlay}>
          <h1 style={styles.title}>Snake-Chat 🐍</h1>
          <p style={styles.text}>Utilise les flèches pour manger les souris !</p>
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
          {/* Affichage du score */}
          <div style={styles.hud}>
            🐭 Score : {score}
          </div>
          
          {/* La zone de jeu */}
          <div style={styles.gameArea}>
            {/* Le Serpent-Chat */}
            {snake.map((segment, index) => (
              <div
                key={index}
                style={{
                  ...styles.gameItem,
                  // On positionne le segment sur la grille
                  left: `calc(${segment.x} * (100% / ${GRID_SIZE}))`,
                  top: `calc(${segment.y} * (100% / ${GRID_SIZE}))`,
                }}
              >
                {/* La tête est un chat, le corps est une patte */}
                {index === 0 ? '🐱' : '🐾'}
              </div>
            ))}
            
            {/* La Souris */}
            <div
              style={{
                ...styles.gameItem,
                left: `calc(${mouse.x} * (100% / ${GRID_SIZE}))`,
                top: `calc(${mouse.y} * (100% / ${GRID_SIZE}))`,
              }}
            >
              🐭
            </div>
          </div>
        </>
      )}
    </>
  );
}