const faqs = [
  {
    question: "Comment puis-je commander sur Animal Food Express ?",
    answer: "C'est très simple ! Vous pouvez parcourir notre boutique, ajouter des articles à votre panier, puis finaliser votre commande. Elle sera directement envoyée à notre équipe via WhatsApp pour une confirmation instantanée.",
    likes: 24,
    dislikes: 2
  },
  {
    question: "Quels sont vos délais de livraison au Maroc ?",
    answer: "Nous livrons partout au Maroc. Pour Casablanca et Rabat, la livraison se fait généralement sous 24h. Pour les autres villes, comptez 48h à 72h ouvrables.",
    likes: 45,
    dislikes: 1
  },
  {
    question: "Quelles marques premium proposez-vous ?",
    answer: "Nous travaillons avec les leaders mondiaux comme Royal Canin, Pro Plan, Hill's, Orijen et Acana pour garantir la meilleure nutrition possible à vos animaux.",
    likes: 38,
    dislikes: 0
  },
  {
    question: "Puis-je retourner un produit si mon animal ne l'aime pas ?",
    answer: "Oui, nous acceptons les retours sous 7 jours si l'emballage n'a pas été ouvert. Pour les sacs ouverts, contactez notre support pour voir si un échange est possible selon les conditions de la marque.",
    likes: 12,
    dislikes: 5
  }
];

async function seed() {
  for (const faq of faqs) {
    try {
      const response = await fetch('http://localhost:3021/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faq)
      });
      if (response.ok) {
        console.log(`Seeded: ${faq.question}`);
      } else {
        console.error(`Failed to seed: ${faq.question}`, response.statusText);
      }
    } catch (e) {
      console.error(`Failed to seed: ${faq.question}`, e.message);
    }
  }
}

seed();
