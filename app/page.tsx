// Cette fonction calcule les jours restants
function getDaysUntilNewYear() {
  // 1. La date d'aujourd'hui
  const today = new Date();
  
  // 2. L'année en cours
  const currentYear = today.getFullYear();
  
  // 3. La date du prochain Nouvel An (1er janvier de l'année prochaine)
  // new Date(année, mois, jour) -> attention, les mois commencent à 0 (0 = Janvier)
  const newYearDate = new Date(currentYear + 1, 0, 1);

  // 4. Calculer la différence de temps en millisecondes
  const diffTime = newYearDate.getTime() - today.getTime();

  // 5. Convertir les millisecondes en jours
  // (1000ms * 60s * 60min * 24h)
  // Math.ceil() arrondit au nombre supérieur pour avoir un nombre de jours complet
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

// Ta page d'accueil
export default function Home() {
  // On appelle la fonction pour récupérer le nombre de jours
  const daysLeft = getDaysUntilNewYear();

  return (
    // J'utilise Tailwind pour centrer le tout facilement
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-green-400 mb-4">
          Combien de dodos avant 2026 ?
        </h1>
        <p className="text-6xl font-extrabold text-white">
          {daysLeft}
        </p>
        <p className="text-xl text-gray-300 mt-2">
          jours restants !
        </p>
      </div>
    </main>
  );
}