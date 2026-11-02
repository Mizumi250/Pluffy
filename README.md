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
- **Backend:** Laravel (PHP), Express (TypeScript), FastAPI (Python), Spring Boot (Java), or ASP.NET Core (C#). Go (Chi) and Rust (Axum) are planned targets.
- **Database:** SQLite (a file per tatemono) or PostgreSQL (a database per tatemono)

The same Tatemono DSL powers multiple frontend and backend targets, with backend-specific variants where needed.

Backend feature coverage is still being brought into parity. ASP.NET Core currently has isolated databases, auth, CRUD validation and policies, plus C# endpoint, handler and middleware variants; queue/scheduler workers, realtime and file storage are not implemented yet.

**The things apps keep needing, already handled—with coverage that varies by backend.**

Auth, real-time updates, notifications, email, background jobs, scheduling, uploads, roles, policies, and error pages are described by the Tatemono DSL. Each backend implements its supported features in its own engine; unsupported features are not implied to work everywhere.

**A way out when you're done.**

When a tatemono is ready, you can export it as a standalone project and take it anywhere.

---

## Meet the tatemonos

The `tatemonos/` folder is a small gallery of what the engine has built so far: café and portfolio sites, a payroll system, a queue manager, a geofenced time clock, a social language-learning app called Kotoba, a FastAPI fixture, and AI Studio for provider-backed chat.

They're also the best way to learn the language. Open any `core.tsx` and you'll see how a whole app reads in one place.

---

## The "Pluffy" part

The project also has an AI side. A fine-tuned model learns the tatemono language and can write one from a plain description of an app. Around it there is:

- a chat window for talking to it
- a small web page, so you can do the same from a browser
- a second-opinion reviewer that can read the whole project
- a scanner that turns the tatemonos themselves into training data

It's bring-your-own-model: you point Pluffy at a model server, such as a local one or a Colab tunnel, and it does the rest.
AI Studio demonstrates provider-backed chat through the FastAPI backend. Provider configuration and supported Tatemono examples are documented in `PLUFF_GUIDELINES_v13.md`.

---

Explore the [Tatemono examples](./tatemonos/) or browse the [language reference](./PLUFF_GUIDELINES_v13.md).

---

## About

Pluffy is made by **Mizumi**, an independent developer and digital artist. It's a personal project that keeps growing, so some corners are newer than others, and the guidelines and the validator are the source of truth. Feedback and curiosity are always welcome.

Thanks for stopping by.


Samples of what Pluff made so far:

- https://hw-coffee.vercel.app/
- https://lain098.vercel.app/
- https://ethereane.vercel.app/
- https://ethan-pool.vercel.app/
- https://cafe-teresita.vercel.app/
- https://shan-shan-eight.vercel.app/


as the engine and its ai improve so as the output
(the future PLUFFY ex Arkzen output will show here)