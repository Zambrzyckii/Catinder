import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';
import { CatTinderService } from './cat.service';
import { CatApiService } from './cat-api.service';
import { SoundService } from './sound.service';

const CHAT_STORAGE_KEY = 'cats-tinder-chat-history';

class LocalStorageMock {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

describe('CatTinderService - chat persistence', () => {
  let storage: LocalStorageMock;

  const catApiMock = {
    fetchSingleRandomCat: () => of({ id: 'api-cat', url: 'http://example.com/cat.jpg' }),
    sendMessageToCat: (_history: string[]) => of('meow back'),
  };
  const soundMock = {
    playMatch: () => {},
    playSend: () => {},
    playReceive: () => {},
    playSwipe: (_toRight: boolean) => {},
  };

  beforeEach(() => {
    storage = new LocalStorageMock();
    (globalThis as Record<string, unknown>)['localStorage'] = storage;

    TestBed.configureTestingModule({
      providers: [
        CatTinderService,
        { provide: CatApiService, useValue: catApiMock },
        { provide: SoundService, useValue: soundMock },
      ],
    });
  });

  afterEach(() => {
    delete (globalThis as Record<string, unknown>)['localStorage'];
  });

  it('sendChatMessageToMatch_MessageSent_SavesHistoryToLocalStorage', () => {
    const service = TestBed.inject(CatTinderService);

    service.sendChatMessageToMatch('cat-1', 'hello there');

    const saved = JSON.parse(storage.getItem(CHAT_STORAGE_KEY)!) as Record<string, string[]>;
    expect(saved['cat-1']).toContain('hello there');
  });

  it('constructor_SavedHistoryExists_RestoresItFromLocalStorage', async () => {
    storage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ 'cat-9': ['hi there'] }));

    const service = TestBed.inject(CatTinderService);

    const histories = await firstValueFrom(service.chatHistory$);
    expect(histories['cat-9']).toEqual(['hi there']);
  });
});
