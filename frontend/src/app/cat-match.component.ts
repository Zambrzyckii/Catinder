import { Component, inject } from '@angular/core'
import { AsyncPipe } from '@angular/common'
import { CatTinderService } from './cat.service'
import { RouterLink } from "@angular/router";
@Component ({
    selector : 'app-match-toast',
    imports: [AsyncPipe, RouterLink],
    template : `
        @if(catService.activeToast$ | async; as matchCat){
            <a
                [routerLink]="['/chat', matchCat.id]"
                class="fixed top-24 right-6 z-50 flex animate-bounce items-center gap-4 rounded-2xl border-4 border-timber bg-honey p-4 shadow-xl"
            >
                <img
                    [src]="matchCat.url"
                    [alt]="matchCat.name"
                    class="size-16 rounded-full border-4 border-timber object-cover object-center"
                />
                <div>
                    <h3 class="font-extrabold text-timber">😻 IT'S A MATCH!</h3>
                    <p class="text-sm font-bold text-timber/80">{{ matchCat.name }} likes you back 💘</p>
                </div>
            </a>
        }
    `
})
export class MatchToastComponent{
    protected catService = inject(CatTinderService);
}
