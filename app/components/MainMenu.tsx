"use client";

import { ActiveGame } from "../page"; // On importe le type depuis la page parente

// On définit les "props" : ce que le composant reçoit
interface MainMenuProps {
  setActiveGame: (game: ActiveGame) => void;
}

// Les styles spécifiques au menu
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
  menuContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  menuButton: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'black',
    backgroundColor: '#FDE047', // Jaune
    padding: '1rem 2rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    border: 'none',
    minWidth: '300px',
  },
  menuTitle: {
    fontSize: '5rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '2rem',
  },
} as const;

// Le composant "Menu"
export default function MainMenu({ setActiveGame }: MainMenuProps) {
  return (
    <div style={styles.overlay}>
      <h1 style={styles.menuTitle}>Arcade à Chats</h1>
      <div style={styles.menuContainer}>
        <button
          onClick={() => setActiveGame("catOnFire")}
          style={styles.menuButton}
          className="hover-scale"
        >
          🐱 Chat en Feu 🔥
        </button>
        <button
          onClick={() => setActiveGame("snake")}
          style={{ ...styles.menuButton, backgroundColor: '#34D399' }} // Vert
          className="hover-scale"
        >
          🐍 Snake-Chat 🐭
        </button>
        <button
          onClick={() => setActiveGame("catcher")}
          style={{ ...styles.menuButton, backgroundColor: '#60A5FA' }} // Bleu
          className="hover-scale"
        >
          🧺 Chat-Catcher ☔
        </button>
      </div>
    </div>
  );
}