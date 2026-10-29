# Catinder

![Angular](https://img.shields.io/badge/Angular-22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![.NET](https://img.shields.io/badge/.NET-10-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Catinder is a Tinder-style web app for cats, built as my first Angular project to learn the basics of the framework. Swipe through cat profiles, like the ones you fancy and wait to see who likes you back. Every match gets its own chat, where the cat answers through an LLM playing a slightly arrogant, always hungry cat that works "meow" into its replies. Likes, matches and conversations are saved in the browser, so they survive a refresh.

![Swiping through cat profiles and chatting with a match](./screenshots/demo.gif)

## Tech stack

- Angular 22
- TypeScript
- RxJS
- Tailwind CSS 4
- Vitest
- Web Audio API
- .NET 10 minimal API
- Groq API
- Docker Compose
- TheCatAPI
- RandomUser
- MeowFacts

## Getting started

Clone the repository and put your Groq API key in `backend/Api/.env`. The key is only needed for the chat, and a free one is available at [console.groq.com](https://console.groq.com/).

```bash
git clone https://github.com/Zambrzyckii/catinder.git
cd catinder
echo "API_KEY=your_groq_api_key" > backend/Api/.env
```

### Docker

Requires Docker with Compose.

```bash
docker compose up --build
```

Open http://localhost:4200. The API runs at http://localhost:5285.

### Manual

Requires Node.js 22.22.3 or newer and the .NET 10 SDK.

Start the backend.

```bash
cd backend/Api
dotnet run
```

Start the frontend in a second terminal, from the repository root.

```bash
cd frontend
npm ci
npm start
```

Open http://localhost:4200. The frontend expects the API at http://localhost:5285, which is where `dotnet run` serves it.
