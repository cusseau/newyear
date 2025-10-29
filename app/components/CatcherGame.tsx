"use client";

// Style simple pour le placeholder
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
  title: {
    fontSize: '3.75rem',
    fontWeight: 'bold',
    color: '#60A5FA', // Bleu
    marginBottom: '1rem',
  },
  text: {
    fontSize: '1.875rem',
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
} as const;

export default function CatcherGame({ goBackToMenu }: { goBackToMenu: () => void }) {
  return (
    <div style={styles.overlay}>
      <h1 style={styles.title}>Jeu Chat-Catcher 🧺</h1>
      <p style={styles.text}>(En cours de construction)</p>
      <button onClick={goBackToMenu} style={styles.menuBackButton} className="hover-scale">
        Retour au Menu
      </button>
    </div>
  );
}