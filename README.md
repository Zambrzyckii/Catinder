# Cat Tinder 

A Tinder-style web app for cats — swipe through cat profiles, collect likes, wait for a match, and then chat with your matched cat. The cat's replies are generated live by an LLM with a dedicated persona: slightly arrogant, always hungry, and weaving "meow" into every answer.

Built as a full-stack portfolio project: **Angular 22** frontend + **.NET 10 minimal API** backend, wired together with **Docker Compose**.

<!-- TODO: add a screenshot or GIF of the swipe deck here -->

## Tech stack

**Frontend**
- Angular 22 (standalone components, Angular Router)
- RxJS — all application state is reactive, driven by a `BehaviorSubject`-based service (`forkJoin`, `switchMap`, `delayWhen`)
- Tailwind CSS 4
- TypeScript, Vitest for unit tests
- Web Audio API — every UI sound (swipe, match, message) is synthesized in code, no audio assets

**Backend**
- .NET 10 / ASP.NET Core minimal API
- Groq API integration (`llama-3.1-8b-instant`) for AI chat replies
- DotNetEnv for local secrets, OpenAPI in development

**Infrastructure**
- Multi-stage Docker builds (Node → nginx for the frontend, .NET SDK → ASP.NET runtime for the backend)
- Docker Compose

**External APIs**

| API | Used for |
| --- | --- |
| [TheCatAPI](https://thecatapi.com/) | cat photos |
| [RandomUser](https://randomuser.me/) | names, gender, phone numbers |
| [MeowFacts](https://meowfacts.herokuapp.com/) | profile bios (real cat facts) |
| [Groq](https://groq.com/) (OpenAI-compatible) | chat replies from matched cats |

## How it works

1. **Swipe deck** — the app keeps a queue of 5 pre-fetched profiles. Each profile is assembled from three public APIs called in parallel (`forkJoin`): a photo, an identity, and a cat-fact bio.
2. **Likes & matches** — swipe right to like a cat. Every cat has a hidden 50% chance of liking you back; the match is confirmed after a random delay (up to 30 seconds), then a toast pops up with a match sound — just like the real thing.
3. **Chat with your match** — each match has its own conversation. Messages go to the .NET backend, which wraps the history in a cat-persona system prompt and forwards it to the LLM via the Groq API.
4. **Undo** — swiped someone away by accident? Step back one profile; an accidental like is reverted too.
5. **Persistence** — likes, matches, and chat histories are stored in `localStorage`, so everything survives a page refresh.

## Architecture

```
   TheCatAPI  ◄──────┐
   RandomUser ◄──────┤  Angular frontend
   MeowFacts  ◄──────┘  (nginx, port 4200)
                              │
                              │  POST /api/cat-chat
                              ▼
                        .NET minimal API   ──────►  Groq API
                        (port 5285)                 (llama-3.1-8b-instant)
```

The backend exists so the Groq API key never reaches the browser — the frontend only talks to its single endpoint:

| Method | Endpoint | Request body | Response |
| --- | --- | --- | --- |
| POST | `/api/cat-chat` | `{ "history": ["..."] }` | `{ "reply": "..." }` |

## Running the project

### Prerequisites

- a Groq API key (free tier available at [console.groq.com](https://console.groq.com/))
- Docker — or Node.js 22+ and the .NET 10 SDK for a manual run

Create `backend/Api/.env`:

```
API_KEY=your_groq_api_key
```

### With Docker (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:4200
- API: http://localhost:5285

### Manually

```bash
# backend
cd backend/Api
dotnet run

# frontend (separate terminal)
cd frontend
npm ci
npm start
```

### Tests

```bash
cd frontend
npm test
```

## Project structure

```
├── backend/Api            # .NET 10 minimal API (single Program.cs)
├── frontend/src/app       # Angular components & services
│   ├── cat.service.ts         # app state: queue, swipes, likes, matches, chats
│   ├── cat-api.service.ts     # HTTP: public cat APIs + backend chat endpoint
│   ├── sound.service.ts       # Web Audio API sound synthesis
│   └── *.component.ts         # swipe deck, likes board, matches board, chat
└── compose.yaml           # Docker Compose for both services
```
