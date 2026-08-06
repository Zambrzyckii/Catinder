import { Component, inject } from '@angular/core';
import { CatTinderService } from './cat.service';
import { SoundService } from './sound.service';
import { AsyncPipe } from '@angular/common';
import { CatCardComponent } from './cat-card.component';
@Component({
  selector: 'app-cat',
  imports: [AsyncPipe, CatCardComponent],
  template: `
    <div class="flex h-full items-center justify-center p-6">
      @if (catService.currentCat$ | async; as cat) {
        <!-- Card deck: upcoming profiles peek out from underneath, Tinder-style -->
        <div class="relative w-full max-w-xs">
          @if (catService.catQueue$ | async; as queue) {
            @for (nextCat of queue.slice(0, 2); track nextCat.id; let i = $index) {
              <div
                class="pointer-events-none absolute inset-0 transition-transform duration-200"
                [style.transform]="'translateY(' + -12 * (i + 1) + 'px) scale(' + (1 - 0.05 * (i + 1)) + ')'"
                [style.zIndex]="10 - i"
                aria-hidden="true"
              >
                <app-cat-card [cat]="nextCat"></app-cat-card>
              </div>
            }
          }
          <div class="relative z-20">
            <app-cat-card
              [cat]="cat"
              (pass)="swipeCatLeft()"
              (smash)="swipeCatRight()"
              (undo)="switchBack()"
            >
            </app-cat-card>
          </div>
        </div>
      } @else {
        <div
          class="flex flex-col items-center gap-4 rounded-2xl border-4 border-timber bg-blush/40 p-8 text-center"
        >
          <span class="emoji animate-bounce text-5xl">🐾</span>
          <p class="font-bold text-timber">Looking for hot cats nearby...</p>
          <button
            (click)="swipeCatLeft()"
            class="rounded-full border-4 border-timber bg-honey px-6 py-2 font-bold text-timber transition-transform hover:scale-105"
          >
            Load first cat <span class="emoji">🐟</span>
          </button>
        </div>
      }
    </div>
  `,
})
export class CatComponent {
  protected readonly catService = inject(CatTinderService);
  private readonly soundService = inject(SoundService);

  protected swipeCatLeft(): void {
    this.soundService.playSwipe(false);
    this.catService.swipeLeftCat();
  }

  protected swipeCatRight(): void {
    this.soundService.playSwipe(true);
    this.catService.swipeRightCat();
  }

  protected switchBack(): void {
    this.catService.switchBack();
  }
}
