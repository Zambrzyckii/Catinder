import { Component, inject } from '@angular/core';
import { CatTinderService } from './cat.service';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-matches-board',
  imports: [AsyncPipe, RouterLink],
  template: `
    <div class="p-6">
      <h1 class="mb-6 flex items-center gap-2 text-2xl font-extrabold text-timber">
        <span class="text-3xl">💌</span> It's a match!
      </h1>

      <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        @for (cat of catMatches$ | async; track cat.id) {
          <div
            class="relative overflow-hidden rounded-2xl border-4 border-timber bg-cream transition-transform hover:-translate-y-1"
          >
            <span
              class="absolute top-2 left-2 z-10 rounded-full border-2 border-timber bg-honey px-2 py-0.5 text-xs font-extrabold text-timber"
            >
              💘 MATCH
            </span>
            <!-- Square frame normalizes any API image aspect ratio -->
            <div class="aspect-square w-full overflow-hidden bg-serenity/20">
              <img
                [src]="cat.url"
                [alt]="cat.name"
                class="h-full w-full object-cover object-center"
              />
            </div>
            <div class="border-t-4 border-timber p-3">
              <p class="font-extrabold text-timber">{{ cat.name }} {{ cat.surname }}</p>
              <p class="text-sm text-timber/80">
                {{ cat.gender === 'male' ? '🐟' : '🌸' }} {{ cat.gender }}
              </p>
              <a
                [routerLink]="['/chat', cat.id]"
                class="mt-2 inline-block rounded-full border-2 border-timber bg-serenity/50 px-3 py-1 text-sm font-bold text-timber transition-transform hover:scale-105"
              >
                💬 Text {{ cat.name }}
              </a>
            </div>
          </div>
        } @empty {
          <div
            class="col-span-full flex flex-col items-center gap-3 rounded-2xl border-4 border-dashed border-timber bg-blush/30 p-10 text-center"
          >
            <span class="text-5xl">🙀</span>
            <p class="font-bold text-timber">No matches yet — keep swiping! 💖</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class MatchesBoardComponent {
  protected readonly catService = inject(CatTinderService);
  catMatches$ = this.catService.matches$;
  protected deleteLike(id: string): void {
    this.catService.deleteCatFromLikes(id);
  }
}
