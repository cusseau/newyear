"use client";

import { useState, useRef } from "react";
import MainMenu from "./components/MainMenu";
import CatOnFireGame from "./components/CatOnFireGame";
import SnakeGame from "./components/SnakeGame";
import CatcherGame from "./components/CatcherGame";

// Le type pour savoir quel jeu est affiché
export type ActiveGame = "menu" | "catOnFire" | "snake" | "catcher";

// Les styles de basex
const styles = {
  main: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#111827',
  }
} as const;

export default function Home() {
  // L'état principal qui contrôle tout
  const [activeGame, setActiveGame] = useState<ActiveGame>("menu");
  
  // Le lecteur audio est ici, au niveau le plus haut
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fonction pour arrêter la musique et revenir au menu
  const goBackToMenu = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActiveGame("menu");
  };

  // Fonction pour démarrer la musique
  const playMusic = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/ambiancesong.mp3"); // Ton nom de fichier
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
    audioRef.current.currentTime = 13;
    audioRef.current.play().catch(e => console.error("Autoplay bloqué: ", e));
  };

  // Le "routeur" qui affiche le bon composant
  // Le "routeur" qui affiche le bon composant
  const renderGame = () => {
    switch (activeGame) {
      case "catOnFire":
        return <CatOnFireGame goBackToMenu={goBackToMenu} playMusic={playMusic} />;
      case "snake":
        return <SnakeGame goBackToMenu={goBackToMenu} />;
      case "catcher":
        // AJOUTE "playMusic" ICI
        return <CatcherGame goBackToMenu={goBackToMenu} playMusic={playMusic} />;
      case "menu":
      default:
        return <MainMenu setActiveGame={setActiveGame} />;
    }
  };

  return (
    <main style={styles.main}>
      {/* On inclut la balise style ici pour qu'elle soit globale */}
      <style>
        {`
          @keyframes flash {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
          .animate-flash {
            animation: flash 0.5s ease-out forwards;
          }
          .hover-scale:hover {
            transform: scale(1.05);
          }
        `}
      </style>
      {/* Affiche le composant actif */}
      {renderGame()}
    </main>
  );
}