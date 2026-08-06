import { Routes } from '@angular/router';
import { CatComponent } from './cat.component';
import { LikesBoardComponent } from './likes-board.component';
import { MatchesBoardComponent } from './match-board.component';
import { ChatComponent } from './chat.component';

export const routes: Routes = [
  { path: '', component: CatComponent },
  { path: 'likes', component: LikesBoardComponent },
  { path: 'matches', component: MatchesBoardComponent },
  { path: 'chat/:catId', component: ChatComponent}
];
