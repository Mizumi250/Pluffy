# Pluffy

**One file in. A whole application out.**

Welcome. Pluffy is a place where an app starts as a single file and grows into a complete, working system: database, backend, web pages, mobile screens and a desktop shell, all from the same source. Make yourself at home.

---

## The idea

Most projects begin with a long afternoon of wiring things together. Pluffy skips that part.

You describe what you want in one file called a **tatemono** (建物, "building" in Japanese). It lives at `tatemonos/<name>/core.tsx` and holds the whole blueprint: the tables, the API, the login, the pages, the look and feel. The engine watches that file and builds everything around it, then rebuilds whenever you save.

Every tatemono is its own small world. It gets its own database, its own users, its own routes and its own pages. Nothing is shared, so you can add one, change one or delete one without disturbing the others.

---

## What lives inside

**One description, many places to run it.**

- **Web:** Next.js, React + Vite, TanStack Start, Astro, or React with Inertia
- **Mobile:** Expo, bare React Native, or Lynx
- **Desktop:** Tauri or Electron
- **Backend:** Laravel, or Express
- **Database:** SQLite (a file per tatemono) or PostgreSQL (a database per tatemono)

You choose the stacks you like, and the tatemono doesn't change when you switch.

**The things apps keep needing, already handled.**

Sign-in and registration, real-time updates, notifications, email, background jobs, scheduled tasks, file uploads, roles and policies, and error pages. You say what you want in the file and the engine generates the rest.

**A way out when you're done.**

When a tatemono is ready, you can export it as a standalone project and take it anywhere.

---

## Meet the tatemonos

The `tatemonos/` folder is a small gallery of what the engine has built so far: café and portfolio sites, a payroll system, a queue manager, a geofenced time clock, a social language-learning app called Kotoba, and plenty of experiments along the way. A few are concept sites made for demonstration and portfolio purposes, and they say so on the page.

They're also the best way to learn the language. Open any `core.tsx` and you'll see how a whole app reads in one place.

---

## The "Pluffy" part

The project also has an AI side. A fine-tuned model learns the tatemono language and can write one from a plain description of an app. Around it there is:

- a chat window for talking to it
- a small web page, so you can do the same from a browser
- a second-opinion reviewer that can read the whole project
- a scanner that turns the tatemonos themselves into training data

It's bring-your-own-model: you point Pluffy at a model server, such as a local one or a Colab tunnel, and it does the rest.

---

## A look around the house

```
tatemonos/        every tatemono: <name>/core.tsx (plus assets)
engine/
  frontend/       the web, mobile and desktop stacks
  backend/        Laravel, and the builders that generate it
projects/         exported, standalone projects
mizumi.js         the friendly front door (the menu is bilingual: English / 日本語)
start.js          starts the backend, the queue, real-time and the frontends
setup.js          one-time setup
export.js         turns a tatemono into a standalone project
pluffy-*.js       the AI tools
PLUFF_GUIDELINES_v12.md   the full language reference
```

---

## Where to begin

Come in through the front door:

```bash
node mizumi.js
```

It will show you what's available, and from there you can set things up, start the engine, switch stacks or generate a tatemono.

When you want to learn the language itself, `PLUFF_GUIDELINES_v13.md` is the reference. It covers every block a tatemono can contain.

Pluffy runs on Windows, Linux and Termux on Android. It needs Node, and PHP with Composer for the Laravel backend.

---

## About

Pluffy is made by **Mizumi**, an independent developer and digital artist. It's a personal project that keeps growing, so some corners are newer than others, and the guidelines and the validator are the source of truth. Feedback and curiosity are always welcome.

Thanks for stopping by.


Samples of what Pluff made so far:

- https://hw-coffee.vercel.app/
- https://lain098-67v0azy8h-mizumi25s-projects.vercel.app/
- https://ethereane.vercel.app/
- https://ethan-pool.vercel.app/
- https://cafe-teresita.vercel.app/
- https://shan-shan-eight.vercel.app/


as the engine and its ai improve so as the output
(the future PLUFFY ex Arkzen output will show here)


