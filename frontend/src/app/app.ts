import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatchToastComponent } from './cat-match.component';
import { CatTinderService } from './cat.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, AsyncPipe, MatchToastComponent],
  template: `
    <div class="flex h-screen flex-col overflow-hidden">
      <!-- TOP NAVBAR: always pinned -->
      <header class="sticky top-0 z-50 shrink-0 border-b-4 border-timber bg-blush">
        <nav class="relative flex items-center justify-center px-6 py-3">
          <a
            routerLink="/"
            class="absolute left-6 flex items-center gap-2 text-2xl font-extrabold text-timber"
          >
            <span class="text-4xl">😻</span> Catinder
          </a>
          <div class="flex gap-3">
            <a
              routerLink="/"
              class="rounded-full border-4 border-timber bg-cream px-4 py-1 font-bold text-timber transition-transform hover:scale-105"
            >
              🐾 Swipe
            </a>
            <a
              routerLink="/likes"
              class="rounded-full border-4 border-timber bg-cream px-4 py-1 font-bold text-timber transition-transform hover:scale-105"
            >
              💖 Likes
            </a>
            <a
              routerLink="/matches"
              class="rounded-full border-4 border-timber bg-cream px-4 py-1 font-bold text-timber transition-transform hover:scale-105"
            >
              💌 Matches
            </a>
          </div>
        </nav>
      </header>

      <div class="flex min-h-0 flex-1">
        <!-- SIDEBAR: matched cats only, fully collapsible via width transition -->
        <aside
          class="shrink-0 overflow-hidden border-timber bg-serenity/20 transition-all duration-300"
          [class.w-24]="sidebarOpen()"
          [class.border-r-4]="sidebarOpen()"
          [class.w-0]="!sidebarOpen()"
        >
          <div class="flex h-full w-24 flex-col items-center gap-4 overflow-y-auto p-4">
            @for (cat of catService.matches$ | async; track cat.id) {
              <a [routerLink]="['/chat', cat.id]" [title]="cat.name" class="block shrink-0">
                <img
                  [src]="cat.url"
                  [alt]="cat.name"
                  class="size-16 rounded-full border-4 border-timber bg-cream object-cover object-center transition-transform hover:scale-110"
                />
              </a>
            } @empty {
              <span class="text-3xl" title="No matches yet">🐟</span>
            }
          </div>
        </aside>

        <!-- Sidebar toggle, overlapping the border -->
        <button
          (click)="sidebarOpen.set(!sidebarOpen())"
          class="z-40 size-10 shrink-0 self-center rounded-full border-4 border-timber bg-honey text-sm transition-transform hover:scale-110"
          [class.-ml-5]="sidebarOpen()"
          [class.ml-2]="!sidebarOpen()"
          title="Toggle matches sidebar"
        >
          {{ sidebarOpen() ? '◀️' : '▶️' }}
        </button>

        <!-- MAIN CONTENT -->
        <main class="min-w-0 flex-1 overflow-y-auto">
          <router-outlet></router-outlet>
        </main>
      </div>

      <app-match-toast></app-match-toast>
    </div>
  `,
  styleUrl: './app.css',
})
export class App {
  protected readonly catService = inject(CatTinderService);
  protected readonly sidebarOpen = signal(true);
}
