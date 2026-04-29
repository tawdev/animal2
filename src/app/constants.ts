import { Testimonial, BlogPost } from './lib/api';

export const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    initial: 'MA',
    name: 'Mohammed Alami',
    role: 'Propriétaire de Labrador — Casablanca',
    content: "La qualité des croquettes est irréprochable. Mes chiens sont en pleine forme depuis que j'achète chez Animal Food Express. Les marques premium sont enfin accessibles. Livraison rapide même en pleine semaine.",
    isActive: true,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 2,
    initial: 'KB',
    name: 'Karim Bensaid',
    role: "Éleveur Félin — Rabat",
    content: "Un service client exceptionnel et des accessoires magnifiques. Mes chats adorent leurs nouveaux arbres à chat. Je recommande vivement pour tous les passionnés d'animaux.",
    isActive: true,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 3,
    initial: 'FZ',
    name: 'Fatine Zahra',
    role: 'Propriétaire — Marrakech',
    content: "J'ai trouvé tout le nécessaire pour mon premier chiot. Conseils précieux du support technique pour choisir la bonne alimentation. C'est rare de trouver une telle expertise en ligne au Maroc.",
    isActive: true,
    createdAt: '',
    updatedAt: ''
  }
];

export const FALLBACK_BLOG_POSTS: BlogPost[] = [
  {
    id: 999,
    title: "Comment gérer les allergies alimentaires de mon Bulldog ?",
    slug: "allergies-alimentaires-bulldog",
    excerpt: "Découvrez les signes d'allergies et comment adapter le régime de votre Bulldog avec des conseils de pro.",
    author: "Dr. Sarah Alami (Vétérinaire)",
    category: "CONSEIL EXPERT",
    imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=1000",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'Published',
    content: "<h2>Les signes qui ne trompent pas</h2><p>Les Bulldogs sont particulièrement sensibles aux allergies alimentaires. Si vous remarquez des rougeurs entre les doigts, des otites à répétition ou des démangeaisons excessives, il est temps de revoir son bol.</p><h3>La solution : Le régime d'éviction</h3><p>Consultez votre vétérinaire pour mettre en place un régime hypoallergénique strict pendant 8 semaines...</p>"
  },
  {
    id: 998,
    title: "Top 5 des jouets d'occupation pour chats d'appartement",
    slug: "top-5-jouets-chats",
    excerpt: "Stimulez l'instinct de chasseur de votre chat avec notre sélection de jouets validée par des comportementalistes.",
    author: "Yassine Drissi (Expert)",
    category: "BIEN-ÊTRE",
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=1000",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'Published',
    content: "<h2>Pourquoi votre chat s'ennuie ?</h2><p>Un chat d'appartement a besoin de stimulation mentale pour éviter le stress et l'obésité. Voici nos 5 recommandations : 1. Le circuit à balles... 2. Le tunnel auto-agrippant...</p>"
  },
  {
    id: 997,
    title: "Hygiène bucco-dentaire : 3 gestes essentiels pour votre chien",
    slug: "hygiene-dentaire-chien",
    excerpt: "Prévenez le tartre et les maladies parodontales grâce à ces conseils simples mais vitaux.",
    author: "Dr. Mehdi Fassi",
    category: "SANTÉ",
    imageUrl: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=1000",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'Published',
    content: "<h2>Le tartre, l'ennemi invisible</h2><p>80% des chiens de plus de 3 ans souffrent de maladies dentaires. Voici comment agir : 1. Le brossage régulier... 2. Les lamelles à mâcher enzymatiques...</p>"
  }
];
