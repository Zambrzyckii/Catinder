import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { CatTinderService } from './cat.service';
import { map, switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
@Component({
    selector : 'app-cat-chat',
    imports : [AsyncPipe],
    template : `
    <div class="flex h-full flex-col">
      <!-- Messages area -->
      <div class="flex flex-1 flex-col gap-3 overflow-y-auto p-6">
        @if (currentChat$ | async; as messages) {
          @for (msg of messages; track $index) {
            <!-- History alternates user/cat; $even = user (right), $odd = cat (left) -->
            @if ($even) {
              <div class="flex justify-end">
                <div
                  class="max-w-xs rounded-2xl rounded-br-none border-4 border-timber bg-honey px-4 py-2 font-medium text-timber md:max-w-md"
                >
                  {{ msg }} <span class="emoji">🐾</span>
                </div>
              </div>
            } @else {
              <div class="flex justify-start">
                <div
                  class="max-w-xs rounded-2xl rounded-bl-none border-4 border-timber bg-blush px-4 py-2 font-medium text-timber md:max-w-md"
                >
                  <span class="emoji">😸</span> {{ msg }}
                </div>
              </div>
            }
          } @empty {
            <div class="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <span class="emoji text-5xl">💌</span>
              <p class="font-bold text-timber">Say hi to your match! <span class="emoji">🐟</span></p>
            </div>
          }
        }

        <!-- Typing indicator while waiting for the cat API -->
        @if (catService.isCatTyping$ | async) {
          <div class="flex justify-start">
            <div
              class="flex items-center gap-1.5 rounded-2xl rounded-bl-none border-4 border-timber bg-blush px-4 py-3"
            >
              <span class="size-2 animate-bounce rounded-full bg-timber"></span>
              <span class="size-2 animate-bounce rounded-full bg-timber delay-100"></span>
              <span class="size-2 animate-bounce rounded-full bg-timber delay-200"></span>
            </div>
          </div>
        }
      </div>

      <!-- Input area -->
      <div class="flex shrink-0 gap-3 border-t-4 border-timber bg-blush/40 p-4">
        <input
          #chatInput
          type="text"
          placeholder="Say something nice... 🐟"
          class="flex-1 rounded-full border-4 border-timber bg-cream px-4 py-2 text-timber placeholder:text-timber/50 focus:ring-4 focus:ring-serenity/40 focus:outline-none"
          (keydown.enter)="send(chatInput.value); chatInput.value = ''"
        />
        <button
          (click)="send(chatInput.value); chatInput.value = ''"
          class="size-12 shrink-0 rounded-full border-4 border-timber bg-coral text-xl transition-transform hover:scale-110"
          title="Send"
        >
          <span class="emoji">💌</span>
        </button>
      </div>
    </div>
    `
})
export class ChatComponent{
    protected readonly catService = inject(CatTinderService);
    public catId = input.required<string>();
    private catId$ = toObservable(this.catId);

    public currentChat$ = this.catId$.pipe(
        switchMap(id => this.catService.chatHistory$.pipe(
            map(histories => histories[id] || [])
        ))
    );

    public send(text : string) : void {
        if(!text.trim()) return;

        this.catService.sendChatMessageToMatch(this.catId(), text);
    }
}
