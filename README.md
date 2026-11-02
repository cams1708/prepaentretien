# Prépa Entretien — ECM

Coach IA qui prépare les étudiant·e·s de l'ECM en alternance à leurs entretiens. C'est la
fonctionnalité **« Prépa entretien »** de la
[Plateforme des Compétences](https://github.com/cams1708/plateforme-des-competences)
(`/dashboard/entretien`, V2 phase 7), extraite en application autonome : **mêmes prompts, même
déroulé, même interface, même compte rendu**.

## Fonctionnement

- L'étudiant·e indique le poste visé (l'IA part du principe que c'est une **alternance**, sauf
  indication contraire), reçoit les **rappels avant le jour J** (tenue, ponctualité, recherches sur
  l'entreprise...), puis le coach passe en mode **recruteur·se RH**.
- Script de questions suivi par le coach, avec un retour de coaching concret après chaque réponse
  (méthode STAR, pièges classiques corrigés avec exemples) :
  a. Pourquoi cette entreprise ? (valeurs, secteur chiffré, taille PME / grand groupe)
  b. Pourquoi ce poste ?
  c. Pourquoi vous, et pas un autre candidat ? (lien expériences ↔ fiche de poste ; fiche de poste
     générée à la demande en cas de candidature spontanée)
  d. Que dirait votre ancien employeur de vous ?
  e. Vos axes d'amélioration ?
  f. Où vous voyez-vous dans 5 à 10 ans ?
  g. Mises en situation liées au poste et au profil
  h. Que faites-vous à la fin de l'entretien ?
  i. Que faites-vous dans les 24h qui suivent ?
- Bilan global, puis bouton **« Terminer la session »** : l'IA génère un **compte rendu structuré**
  (synthèse, points forts, axes d'amélioration, conseils clés) stocké dans
  `chat_conversations.metadata.summary`. Une nouvelle session peut être relancée aussitôt.
- **Historique** des sessions (compte rendu + transcription complète) pour l'étudiant·e.
- **Profil** (`/dashboard/profil`) : prénom, accroche, diplôme, année, compétences, expériences —
  utilisés par le coach pour personnaliser ses questions (ex : le cas particulier bac+3 de la
  question f, les mises en situation g).
- **Espace CREE / direction** (`/staff`) : liste des étudiant·e·s, nombre de sessions, et
  consultation de chaque compte rendu / transcription (lecture seule, via RLS).

Garde-fous repris de la plateforme : clé API uniquement côté serveur (Server Actions), 80 messages
max par session, nettoyage du texte généré (Markdown, caractères non français), récupération en cas
de course à la création de conversation, déconnexion après 24h d'inactivité.

## Stack

Next.js 15 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS v4 + shadcn/ui ·
Supabase (Auth, Postgres, RLS) · API Claude (`@anthropic-ai/sdk`).

Fichiers clés :

| Fichier | Rôle |
| --- | --- |
| `src/lib/ai/interview-prep.ts` | Prompt système du coach + génération du compte rendu |
| `src/lib/ai/interview-prep-checklist.ts` | Rappels « avant le jour J » |
| `src/lib/actions/interview-prep.ts` | Création de session, envoi de message, fin de session |
| `src/app/dashboard/entretien/` | Page et chat de simulation |
| `src/components/interview-prep/interview-prep-history.tsx` | Historique (étudiant·e et CREE) |
| `supabase/migrations/0001_init.sql` | Schéma + RLS |

## Installation

1. Créer un projet [Supabase](https://supabase.com), puis exécuter
   `supabase/migrations/0001_init.sql` dans le SQL editor.
2. Copier `.env.example` vers `.env.local` et renseigner les variables (URL + clé anon Supabase,
   `NEXT_PUBLIC_SITE_URL`, `ANTHROPIC_API_KEY`).
3. Dans Supabase > Authentication > URL Configuration, ajouter `<NEXT_PUBLIC_SITE_URL>/auth/callback`
   aux URL de redirection autorisées.
4. Lancer :

```bash
npm install
npm run dev
```

## Comptes CREE / direction

L'inscription crée toujours un compte **étudiant**. Pour donner l'accès à l'espace `/staff`, créer
le compte normalement puis, dans le SQL editor de Supabase :

```sql
update public.profiles set role = 'staff' where email = 'prenom.nom@ecm.fr';
```

(`'admin'` donne le même accès.)

## Déploiement

Compatible Vercel tel quel (`maxDuration = 60` sur la page de simulation pour laisser le temps à
l'API Claude de répondre). Renseigner les mêmes variables d'environnement dans le projet Vercel.
