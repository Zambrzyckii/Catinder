# Project "Catinder" - System Guidelines for AI Assistant

## Project Context
The project is an SPA (Single Page Application) acting as a "Tinder for cats". The application merges data from two independent APIs (The Cat API for images and Random User API for personal data) to generate unique profiles. The user can reject cats or add them to likes, while a background mechanism randomly determines "Matches" (mutual likes).

## Tech Stack
* **Main framework:** Angular 17+ (strictly Standalone Components).
* **HTML Templates:** New Control Flow mechanism (using `@if`, `@for`, `@empty` instead of legacy `*ngIf`, `*ngFor` directives).
* **Reactivity and State:** RxJS (`BehaviorSubject`, `Observable`, `pipe` operators).
* **Subscriptions:** Managed primarily from the HTML template level using the `| async` pipe.

## Architectural Principles and Clean Code (SOLID)
* **Single Responsibility Principle (SRP):** Services responsible for HTTP requests (e.g., `CatApiService`) must be completely isolated from services managing state and business logic (e.g., `CatTinderService`).
* **State Management:** Application state (cat queue, history, likes) is held in memory using `BehaviorSubject` instances.
* **Immutability:** Changes to array states must be performed without mutation. Using methods like `push()` or `splice()` directly on the state is strictly forbidden. Use the spread operator (`...`), `.filter()`, `.map()`, or `.slice()`.
* **Queuing (Buffering):** The application ensures a smooth user experience (UX) by asynchronously buffering upcoming profiles in the background, preventing the user from being blocked while waiting for a server response.
* **Component Architecture:** We aim for a strict separation into "Smart" components (with injected services, managing data) and "Dumb" components (purely presentational, relying solely on `@Input` and `@Output`).

## User Communication Guidelines
* The user has a strong foundation in C# and the .NET platform. Always explain new and complex concepts from the TypeScript/Angular ecosystem using analogies to the C# world (e.g., LINQ, data structures, Entity Framework, .NET design patterns).
* Unless explicitly asked for a final solution to a specific problem, never provide ready-made code for tasks.
* Explain mechanics and theory using minimalist, "logic-only" code examples (pseudocode or simplified TS code) that demonstrate the underlying mechanics.
* The user strongly prefers code examples over external links or text-heavy documentation.
* Assume C# is the default programming language for architectural comparisons and logic queries unless specified otherwise.