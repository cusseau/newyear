"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// --- Définitions ---
// MODIFIÉ: L'objet qui tombe peut être un chat ou une souris
interface FallingItem {
  id: number;
  x: number; // Position horizontale (en %)
  y: number; // Position verticale (en %)
  speed: number;
  type: 'cat' | 'mouse'; // NOUVEAU
}
type GameState = "idle" | "playing" | "lost";

// Props (inchangées)
interface CatcherGameProps {
  goBackToMenu: () => void;
  playMusic: () => void;
}

// Constantes de jeu
const LIVES_START = 5;
const BASKET_WIDTH = 120; // Largeur du panier (en pixels)
const ITEM_WIDTH = 80; // Largeur des items (en pixels)
const BASKET_SPEED = 2.5; // Vitesse de déplacement du panier

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
    bottom: '5%', // En bas de l'écran
    fontSize: '120px', // Taille du panier (emoji)
    zIndex: 15,
    transform: 'translateX(-50%)', // Centrer le panier
  },
  fallingItem: {
    position: 'absolute',
    zIndex: 12,
    transition: 'top 0.1s linear',
  }
} as const;


// --- Composant Jeu "Chat-Catcher" ---
export default function CatcherGame({ goBackToMenu, playMusic }: CatcherGameProps) {
  // MODIFIÉ: État des items (chats et souris)
  const [items, setItems] = useState<FallingItem[]>([]);
  // MODIFIÉ: Position du panier (en % depuis la gauche)
  const [basketX, setBasketX] = useState(50); 
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES_START);
  const [gameState, setGameState] = useState<GameState>("idle");
  
  // NOUVEAU: États pour le mouvement au clavier
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);

  // Fonction pour réinitialiser le jeu
  const initializeGame = () => {
    setScore(0);
    setLives(LIVES_START);
    setItems([]);
    setBasketX(50); // Replacer le panier au centre
  };

  const startGame = () => {
    initializeGame();
    setGameState("playing");
    playMusic();
  };

  // --- NOUVELLE LOGIQUE : CONTRÔLES CLAVIER ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setMoveLeft(true);
      if (e.key === 'ArrowRight') setMoveRight(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setMoveLeft(false);
      if (e.key === 'ArrowRight') setMoveRight(false);
    };

    // On attache les écouteurs à la fenêtre
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      // On nettoie les écouteurs quand le composant est "démonté"
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []); // Se lance une seule fois

  
  // --- BOUCLE DE JEU (Mouvement + Chute + Collision) ---
  useEffect(() => {
    if (gameState !== "playing") return;

    // Cette boucle gère tout: mouvement panier, chute items, collisions
    const gameLoop = setInterval(() => {
      // 1. Mouvement du panier
      setBasketX((currentX) => {
        let newX = currentX;
        if (moveLeft) newX -= BASKET_SPEED;
        if (moveRight) newX += BASKET_SPEED;
        
        // Bloquer le panier dans l'écran (avec largeur en % pour le calcul)
        const basketWidthPercent = (BASKET_WIDTH / window.innerWidth) * 100;
        if (newX < basketWidthPercent / 2) newX = basketWidthPercent / 2;
        if (newX > 100 - basketWidthPercent / 2) newX = 100 - basketWidthPercent / 2;
        
        return newX;
      });

      // 2. Chute des items et collisions
      setItems((currentItems) => {
        let newLives = lives;
        let newScore = score;

        const updatedItems = currentItems.map(item => {
          const newY = item.y + item.speed;
          
          if (newY > 90) { // L'item a atteint le bas
            // Logique de collision (simplifiée, en %)
            const basketLeft = basketX - (BASKET_WIDTH / window.innerWidth * 100) / 2;
            const basketRight = basketX + (BASKET_WIDTH / window.innerWidth * 100) / 2;
            
            // Si le centre de l'item est dans le panier
            if (item.x > basketLeft && item.x < basketRight) {
              // --- C'EST ATTRAPÉ ! ---
              if (item.type === 'cat') {
                newScore += 10; // +10 points pour un chat
              } else {
                newScore -= 5; // -5 points pour une souris
              }
            } else {
              // --- C'EST RATÉ ! ---
              if (item.type === 'cat') {
                newLives--; // On perd une vie si on rate un chat
              }
              // Si on rate une souris, on s'en fiche
            }
            return null; // Marque l'item pour suppression
          }
          
          return { ...item, y: newY }; // Met à jour la position Y
        }).filter(Boolean) as FallingItem[];

        // Met à jour les états
        setScore(newScore);
        setLives(newLives);
        
        if (newLives <= 0) {
          setGameState("lost");
        }
        
        return updatedItems;
      });
    }, 50); // Boucle de jeu plus rapide (environ 20fps)

    return () => clearInterval(gameLoop);
  }, [gameState, lives, score, basketX, moveLeft, moveRight]);


  
  // 3. Générateur d'items (CHATS et SOURIS)
  useEffect(() => {
    if (gameState !== "playing") return;

    // MODIFIÉ: Fréquence d'apparition plus lente (2.2 secondes)
    const spawnLoop = setInterval(() => {
      // 70% de chance d'être un chat, 30% d'être une souris
      const itemType: 'cat' | 'mouse' = Math.random() > 0.3 ? 'cat' : 'mouse';
      
      setItems((currentItems) => [
        ...currentItems,
        {
          id: Date.now(),
          x: Math.random() * 90 + 5,
          y: -10,
          speed: 1 + Math.random() * 1.5, // Vitesse plus gérable
          type: itemType, // On assigne le type
        }
      ]);
    }, 2200); // MODIFIÉ: Plus lent

    return () => clearInterval(spawnLoop);
  }, [gameState]);


  // --- Rendu JSX du jeu ---
  return (
    // On n'écoute plus la souris ici
    <div style={{...styles.main, cursor: 'auto'}}> 
    
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
          {/* Affichage du score */}
          <div style={{ ...styles.hud, left: '1rem' }}>
            🐱 Score : {score}
          </div>
          {/* Affichage des vies */}
          <div style={{ ...styles.hud, right: '1rem', color: lives <= 1 ? '#EF4444' : 'white' }}>
            ❤️ Vies : {lives}
          </div>
          
          {/* Le panier (Emoji) */}
          <div style={{ ...styles.basket, left: `${basketX}%` }}>
            🧺
          </div>

          {/* MODIFIÉ: Les items qui tombent (Images) */}
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                ...styles.fallingItem,
                left: `calc(${item.x}% - ${ITEM_WIDTH / 2}px)`, // Centrer l'image
                top: `${item.y}%`,
              }}
            >
              {/* On affiche la bonne image selon le type */}
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