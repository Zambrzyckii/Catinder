import { Injectable } from '@angular/core';
import { Cat } from './cat.model';
import { Observable, BehaviorSubject, map, Subject, delayWhen, timer, startWith, switchMap } from 'rxjs';
import { CatApiService } from './cat-api.service';
import { SoundService } from './sound.service';

const STORAGE_KEY = 'cats-tinder-goes-brrrr';
const CHAT_STORAGE_KEY = 'cats-tinder-chat-history';

@Injectable({ providedIn: 'root' })
export class CatTinderService {
  private currentCatSubject = new BehaviorSubject<Cat | null>(null);
  private historyCatSubject = new BehaviorSubject<Cat[]>([]);
  private currentCatLikesSubject = new BehaviorSubject<Cat[]>([]);
  private catQueueSubject = new BehaviorSubject<Cat[]>([]);
  private chatHistorySubject = new BehaviorSubject<Record<string, string[]>>({});
  private catTypingSubject = new BehaviorSubject<boolean>(false);
  public readonly isCatTyping$ = this.catTypingSubject.asObservable();


  private isFetching = false;
  private readonly catQueueSize = 5;

  private pendingMatchesSubject = new Subject<Cat>();
  private showToastSubject = new Subject<Cat>();

  public readonly matchToast$ = this.showToastSubject.asObservable();
  public currentCat$: Observable<Cat | null> = this.currentCatSubject.asObservable();
  public currentCatLikes$: Observable<Cat[]> = this.currentCatLikesSubject.asObservable();
  public historyCats$: Observable<Cat[]> = this.historyCatSubject.asObservable();
  public chatHistory$ = this.chatHistorySubject.asObservable();
  public readonly catQueue$: Observable<Cat[]> = this.catQueueSubject.asObservable();

  public readonly matches$: Observable<Cat[]> = this.currentCatLikes$.pipe(
    map((cats) => cats.filter((cat) => cat.match)),
  );

  public readonly activeToast$: Observable<Cat | null> = this.showToastSubject.pipe(
    switchMap(cat => timer(3000).pipe(map(() => null), startWith(cat)))
  )

  constructor(private apiService: CatApiService, private soundService: SoundService) {

    const savedLikesJson = this.readStorage(STORAGE_KEY);

    if(savedLikesJson){
      const recoverLikes = JSON.parse(savedLikesJson);
      this.currentCatLikesSubject.next(recoverLikes)
    }

    this.currentCatLikes$.subscribe(currentLikesArray => {
        const jsonToSave = JSON.stringify(currentLikesArray);
        this.writeStorage(STORAGE_KEY, jsonToSave);
    });

    const savedChatJson = this.readStorage(CHAT_STORAGE_KEY);

    if (savedChatJson) {
      const recoveredChats = JSON.parse(savedChatJson);
      this.chatHistorySubject.next(recoveredChats);
    }

    this.chatHistory$.subscribe(currentChats => {
        const jsonToSave = JSON.stringify(currentChats);
        this.writeStorage(CHAT_STORAGE_KEY, jsonToSave);
    });

    this.pendingMatchesSubject.pipe(
      delayWhen(() => timer(Math.random() * 30000))
    ).subscribe(confirmedCat => {
      const currentLikes = this.currentCatLikesSubject.value;
      const updatedLikes = currentLikes.map(c => c.id === confirmedCat.id ? {...c, match:true} : c);

      this.currentCatLikesSubject.next(updatedLikes);
      this.showToastSubject.next(confirmedCat);
      this.soundService.playMatch();
    })

    this.loadCatsToQueue();
  }

  loadNextCat(): void {
    this.popCatsFromQueue();
  }

  swipeLeftCat(): void {
    this.loadNextCat();
  }
  swipeRightCat(): void {
    const cat = this.currentCatSubject.value;
    if (cat) {
      const isActuallyMatch = cat.match;
      const hiddenCat = { ...cat, match:false};

      const currentLikes = this.currentCatLikesSubject.value;
      this.currentCatLikesSubject.next([...currentLikes, hiddenCat]);

      if(isActuallyMatch) this.pendingMatchesSubject.next(cat);
    }
    this.loadNextCat();
  }

  deleteCatFromLikes(id: string) {
    const currentLikes = this.currentCatLikesSubject.value;
    const newCurrentLikes = currentLikes.filter((cat) => cat.id !== id);
    this.currentCatLikesSubject.next(newCurrentLikes);
  }

  switchBack(): void {
    const currentHistory = this.historyCatSubject.value;

    if (currentHistory.length > 0) {
      const lastCat = currentHistory[currentHistory.length - 1];
      const catCurrentlyOnScreen = this.currentCatSubject.value;
      this.historyCatSubject.next(currentHistory.slice(0, -1));

      if (catCurrentlyOnScreen) {
        const currentQueue = this.catQueueSubject.value;
        this.catQueueSubject.next([catCurrentlyOnScreen, ...currentQueue]);
      }

      const likes = this.currentCatLikesSubject.value;
      const wasLiked = likes.some((item) => item.id === lastCat.id);

      if (wasLiked) this.deleteCatFromLikes(lastCat.id);

      this.currentCatSubject.next(lastCat);
    }
  }

  sendChatMessageToMatch(catId : string, userMessage : string ) : void {
    const currentHistories = this.chatHistorySubject.value;

    const historyForThisCat = currentHistories[catId] || [];

    const updatedHistory = [...historyForThisCat, userMessage];

    this.chatHistorySubject.next({
      ...currentHistories,
      [catId] : updatedHistory
    });

    this.soundService.playSend();
    this.catTypingSubject.next(true);

    this.apiService.sendMessageToCat(updatedHistory).subscribe({
        next : (catReply) => {
            this.catTypingSubject.next(false);

            const lastestHistories = this.chatHistorySubject.value;
            const lastestHistoriesForCat = lastestHistories[catId] || [];

            this.chatHistorySubject.next({
              ...lastestHistories,
              [catId] : [...lastestHistoriesForCat, catReply]
            });

            this.soundService.playReceive();
        },
        error: (err) => {
            this.catTypingSubject.next(false);
            console.error('Chat error', err);
        }
    });
  }


  private loadCatsToQueue(): void {
    if (this.isFetching) return;
    if (this.catQueueSubject.value.length > this.catQueueSize) return;

    this.isFetching = true;

    this.apiService.fetchSingleRandomCat().subscribe({
      next: (profile) => {
        const readyCat: Cat = { ...profile, match: Math.random() > 0.5 };
        const currentCatQueue = this.catQueueSubject.value;
        this.catQueueSubject.next([...currentCatQueue, readyCat]);
        this.isFetching = false;
        if (currentCatQueue.length + 1 < this.catQueueSize) {
          this.loadCatsToQueue();
        }

        if (this.currentCatSubject.value === null) {
          this.popCatsFromQueue();
        }
      },
      error: (err) => {
        console.error('API ERROR', err);
        this.isFetching = false;
      },
    });
  }

  /** localStorage is unavailable in tests/SSR, so every access goes through these guards. */
  private readStorage(key: string): string | null {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
  }

  private writeStorage(key: string, value: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, value);
  }

  private popCatsFromQueue(): void {    const currentCat = this.currentCatSubject.value;

    if (currentCat) {
      const currentHistory = this.historyCatSubject.value;
      this.historyCatSubject.next([...currentHistory, currentCat]);
    }

    const currentCatQueue = this.catQueueSubject.value;
    if (currentCatQueue.length > 0) {
      const firstCat = currentCatQueue[0];
      const newQueue = currentCatQueue.slice(1);
      this.catQueueSubject.next(newQueue);
      this.currentCatSubject.next(firstCat);
    } else {
      this.currentCatSubject.next(null);
    }

    if (currentCatQueue.length < this.catQueueSize) {
      this.loadCatsToQueue();
    }
  }
}
