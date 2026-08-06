import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { Cat } from './cat.model';

const SWIPE_THRESHOLD_PX = 100;
const FLY_OFF_PX = 600;
const FLY_OFF_MS = 180;

@Component({
  selector: 'app-cat-card',
  template: `
    <!-- Drag wrapper: pointer events make the whole card grabbable (mouse + touch) -->
    <div
      class="w-full max-w-xs cursor-grab touch-none select-none active:cursor-grabbing"
      (pointerdown)="onDragStart($event)"
      (pointermove)="onDragMove($event)"
      (pointerup)="onDragEnd()"
      (pointercancel)="onDragEnd()"
    >
      <!-- Narrow, phone-like vertical card: ~1/4 to 1/6 of the screen -->
      <div
        class="relative overflow-hidden rounded-2xl border-4 border-timber bg-cream shadow-xl"
        [class.transition-transform]="!dragging()"
        [class.duration-200]="!dragging()"
        [style.transform]="cardTransform()"
      >
        <!-- Swipe badges, faded in proportionally to the drag distance -->
        <span
          class="absolute top-4 left-4 z-10 -rotate-12 rounded-lg border-4 border-honey bg-cream/80 px-3 py-1 text-2xl font-extrabold text-honey"
          [style.opacity]="likeOpacity()"
        >
          LIKE <span class="emoji">💖</span>
        </span>
        <span
          class="absolute top-4 right-4 z-10 rotate-12 rounded-lg border-4 border-coral bg-cream/80 px-3 py-1 text-2xl font-extrabold text-coral"
          [style.opacity]="nopeOpacity()" 
        >
          NOPE <span class="emoji">❌</span>
        </span>

        <!-- Fixed 3:4 frame normalizes any API image aspect ratio -->
        <div class="aspect-[3/4] w-full overflow-hidden bg-serenity/20">
          <img
            [src]="cat.url"
            [alt]="cat.name"
            draggable="false"
            class="h-full w-full object-cover object-center"
          />
        </div>

        <div class="border-t-4 border-timber p-4">
          <div class="flex items-baseline justify-between gap-2">
            <h2 class="text-xl font-extrabold text-timber">{{ cat.name }} {{ cat.surname }}</h2>
            <span
              class="shrink-0 rounded-full border-2 border-timber bg-rosette/50 px-2 py-0.5 text-xs font-bold text-timber"
            >
              <span class="emoji">{{ cat.gender === 'male' ? '🐟' : '🌸' }}</span> {{ cat.gender }}
            </span>
          </div>
          <p class="mt-2 line-clamp-3 text-sm text-timber/80">{{ cat.bio }}</p>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center justify-center gap-5 border-t-4 border-timber bg-blush/40 p-4" (pointerdown)="$event.stopPropagation()">
          <button
            (click)="undo.emit()"
            class="size-12 rounded-full border-4 border-timber bg-serenity/50 text-xl transition-transform hover:scale-110"
            title="Undo"
          >
            <span class="emoji">↩️</span>
          </button>
          <button
            (click)="pass.emit()"
            class="size-16 rounded-full border-4 border-timber bg-rosette text-3xl transition-transform hover:scale-110"
            title="Nope"
          >
            <span class="emoji">❌</span>
          </button>
          <button
            (click)="smash.emit()"
            class="size-16 rounded-full border-4 border-timber bg-honey text-3xl transition-transform hover:scale-110"
            title="Like"
          >
            <span class="emoji">💖</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class CatCardComponent {
  @Input({ required: true }) cat!: Cat;
  public console = console
  @Output() pass = new EventEmitter<void>();
  @Output() smash = new EventEmitter<void>();
  @Output() undo = new EventEmitter<void>();

  protected readonly dragX = signal(0);
  protected readonly dragging = signal(false);
  private dragStartX = 0;

  protected readonly cardTransform = computed(
    () => `translateX(${this.dragX()}px) rotate(${this.dragX() / 15}deg)`,
  );
  protected readonly likeOpacity = computed(() =>
    Math.min(Math.max(this.dragX() / SWIPE_THRESHOLD_PX, 0), 1),
  );
  protected readonly nopeOpacity = computed(() =>
    Math.min(Math.max(-this.dragX() / SWIPE_THRESHOLD_PX, 0), 1),
  );

  ngOnChanges(): void {
    this.dragX.set(0);
    this.dragging.set(false);
  }

  protected onDragStart(event: PointerEvent): void {
    this.dragging.set(true);
    this.dragStartX = event.clientX - this.dragX();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected onDragMove(event: PointerEvent): void {
    if (!this.dragging()) return;
    this.dragX.set(event.clientX - this.dragStartX);
  }

  protected onDragEnd(): void {
    if (!this.dragging()) return;
    this.dragging.set(false);

    const dx = this.dragX();
    if (dx > SWIPE_THRESHOLD_PX) {
      this.flyOff(FLY_OFF_PX, () => this.smash.emit());
    } else if (dx < -SWIPE_THRESHOLD_PX) {
      this.flyOff(-FLY_OFF_PX, () => this.pass.emit());
    } else {
      this.dragX.set(0);
    }
  }

  /** Animate the card off-screen, then emit so the parent swaps in the next cat. */
  private flyOff(targetX: number, emit: () => void): void {
    this.dragX.set(targetX);
    setTimeout(() => {
      this.dragX.set(0);
      emit();
    }, FLY_OFF_MS);
  }
}
