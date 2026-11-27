# Pluffy

**One file in. A whole application out.**

Pluffy is a place where an app starts as a single file and grows into a complete, working system: database, backend, web pages, mobile screens and a desktop shell, all from the same source. Make yourself at home.

DOWNLOAD HERE: [Pluffy Studio](https://pluffy-engine.vercel.app/)

---

## The idea

Most projects begin with a long afternoon of wiring things together. Pluffy skips that part.

You describe what you want in one file called a **tatemono** (建物, "building" in Japanese). It holds the whole blueprint: the tables, the API, the login, the pages, the look and feel. The engine watches that file and builds everything around it, then rebuilds whenever you save.

Every tatemono is its own small world. It gets its own database, its own users, its own routes and its own pages. Nothing is shared, so you can add one, change one or delete one without disturbing the others.

---

## What lives inside

**One description, many places to run it.**

- **Web:** Next.js, React + Vite, TanStack Start, Astro, or React with Inertia
- **Mobile:** Expo, bare React Native, or Lynx
- **Desktop:** Tauri or Electron
- **Games:** Godot 4, Unity and Unreal Engine 5 projects generated from dedicated game DSLs
- **Backend:** Laravel (PHP), Express (TypeScript), FastAPI (Python), Spring Boot (Java), ASP.NET Core (C#), Go, or Rust
- **Database:** SQLite (a file per tatemono) or PostgreSQL (a database per tatemono)
- **BrowserExtension:** in progress...phase 4
- **TUI/CLI:** in progress...phase 1
- **Packages:** in progress...phase 3s
- **OS:** soon...

Pick the stack you like, and the same tatemono runs on it.

**The things apps keep needing, already handled.**

Login, real-time updates, notifications, email, background jobs, scheduling, uploads, roles and permissions, and error pages can all be described right inside a tatemono. Some backends are further along than others, and they're all growing.

**A way out when you're done.**

When a tatemono is ready, export it as a standalone project and take it anywhere.
You can also export a dedicated Godot 4, Unity or Unreal Engine game Tatemono as an
isolated game project.

---

## Meet the tatemonos

The `tatemonos/` folder is a small gallery of what Pluffy has built so far: café and portfolio sites, a payroll system, a queue manager, a geofenced time clock, a social language-learning app called Kotoba, and an AI chat studio.

They're also the best way to learn the language. Open any `core.tsx` and you'll see how a whole app reads in one place.

### Screenshots

The latest web `index.png` screenshot for each Tatemono is added here
automatically when `npm run shots -- --module=<name>` completes. To rebuild the
index from web screenshots already in `Shots/web/`, run
`npm run shots -- --update-readme`.

<!-- TATEMONO_SHOTS:START -->
<table>
<tr><td align="center"><a href="./tatemonos/kairo/core.tsx"><img src="./Shots/web/nextjs/kairo/index.png" alt="kairo index screenshot" width="420"><br><strong>kairo</strong></a></td><td align="center"><a href="./tatemonos/kotoba/core.tsx"><img src="./Shots/web/nextjs/kotoba/index.png" alt="kotoba index screenshot" width="420"><br><strong>kotoba</strong></a></td></tr>
<tr><td align="center"><a href="./tatemonos/rubik-solver/core.tsx"><img src="./Shots/web/react-vite/rubik-solver/index.png" alt="rubik-solver index screenshot" width="420"><br><strong>rubik-solver</strong></a></td><td></td></tr>
</table>
<!-- TATEMONO_SHOTS:END -->

---

## The AI side

Pluffy has a brain too. A fine-tuned model learns the tatemono language and can write one from a plain description of an app. Around it there is:

- a chat window for talking to it
- a small web page, so you can do the same from a browser
- a second-opinion reviewer that can read the whole project
- a scanner that turns the tatemonos themselves into training data

It's bring-your-own-model: point Pluffy at a model server, such as a local one or a Colab tunnel, and it does the rest.

---

## Made with Pluffy

V0 ARKZEN
- [hw-coffee](https://hw-coffee.vercel.app/)
- [lain098](https://lain098.vercel.app/)
- [ethereane](https://ethereane.vercel.app/)
- [ethan-pool](https://ethan-pool.vercel.app/)
- [cafe-teresita](https://cafe-teresita.vercel.app/)
- [shan-shan](https://shan-shan-eight.vercel.app/)

V1
- [Kotoba](https://kotoba-khaki.vercel.app/)
- [Rubik-Solver](https://rubik-solver-gamma.vercel.app/)
- [Kairo](https://kairo-delta-eight.vercel.app/)

As the engine and its AI improve, so does the output.

---

Explore the [tatemono examples](./tatemonos/) or browse the [language reference](./PLUFF_GUIDELINES_v14.md).

---

## About

Pluffy is made by **Mizumi**, an independent developer and digital artist. It's a personal project that keeps growing, so some corners are newer than others. Feedback and curiosity are always welcome.

Thanks for stopping by.

---

## Everything through `mizumi.js`

You don't have to remember a pile of scripts. Run one command and pick what you want from the menu:

```
node mizumi.js
```

Almost everything Pluffy can do is in that menu, and each item also works as a direct command if you'd rather type it. `node mizumi.js help` lists them all.

**Run it**
- **Setup** installs what Pluffy needs the first time.
- **Start engine** runs the engine. You choose web, app, desktop, or any mix, and it rebuilds when you save a tatemono.
- **Screenshot** takes a screenshot of a tatemono's web page.

**Write it**
- **New tatemono** creates a `core.tsx` from a template: web, crud, routes, auth, native, multi, lynx, files, godot, unity or unreal.
- **Add DSL block** adds a block to a tatemono. You pick the tatemono, the kind of block (data, backend code, web, native, Lynx, frames, files, Godot, Unity, Unreal), the block, and the backend language if it needs one. Pluffy writes the starting block with the right tags, and you fill in the rest.
- **List modules** shows every tatemono Pluffy knows about.

**Choose your stack**
- Switch the web stack, app stack or desktop stack.
- Switch the backend: Laravel, Express, FastAPI, Spring Boot, ASP.NET Core, Go or Rust.
- Switch the database between SQLite and PostgreSQL.
- Install or remove the packages for each stack, and see which stacks are active.

**Take it with you**
- **Export project** turns a tatemono into a standalone web, app, desktop, Godot, Unity or Unreal project. You can add Docker files and OpenAPI docs while you export.
- **OpenAPI docs** writes `openapi.json` and a Swagger page for a tatemono, so tools like Postman can import it.
- **Publish to GitHub** pushes an exported project using the Git login you already have.

**Use the AI**
- **Pluffy AI** writes a tatemono from a plain description of your app, using the model you point it at.
- **Review** has a second AI read the whole project and suggest edits, which you approve one by one.
- **Chat** opens the chat window.
- **Scan training data** turns the tatemonos into training data.
- **Update tatemono index** refreshes the list of online examples in the language reference.

A few direct commands to get the feel of it:

```
node mizumi.js new my-app --template=crud
node mizumi.js block my-app web:page about
node mizumi.js backend express
node mizumi.js export my-app nextjs
node mizumi.js start --only=web
```
