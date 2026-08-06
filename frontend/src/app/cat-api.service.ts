import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin } from 'rxjs';
import { CatProfile } from './cat.model';
import { CatApiDto } from './cat.api.dto';
import { RandomUserDto } from './randomUser.api.dto';
import { catBioDto } from './cat-bio.dto';
@Injectable({ providedIn: 'root' })
export class CatApiService {
  constructor(private httpClient: HttpClient) {}

  public fetchSingleRandomCat(): Observable<CatProfile> {
    const catRequest$ = this.httpClient.get<CatApiDto[]>(
      'https://api.thecatapi.com/v1/images/search',
    );
    const userRequest$ = this.httpClient.get<RandomUserDto>('https://randomuser.me/api/');
    const meowFactRequest$ = this.httpClient.get<catBioDto>('https://meowfacts.herokuapp.com/');

    return forkJoin([catRequest$, userRequest$, meowFactRequest$]).pipe(
      map(([catResponse, userResponse, meowFactResponse]) => {
        const catDto = catResponse[0];
        return this.mapToCatProfile(catDto, userResponse, meowFactResponse);
      }),
    );
  }

  public sendMessageToCat(chatHistory : string[]) : Observable<string> {
    const backnedUrl = 'http://localhost:5285/api/cat-chat';

    const payload = {
      history : chatHistory
    };

    return this.httpClient.post<{reply : string}>(backnedUrl, payload).pipe(
      map(response => response.reply)
    );
  }

  private mapToCatProfile(catDto: CatApiDto, userDto: RandomUserDto, factDto : catBioDto): CatProfile {
    const user = userDto.results[0];
    const catBio = factDto.data[0];
    return {
      id: catDto.id,
      url: catDto.url,
      name: user.name.first,
      surname: user.name.last,
      phonenumber: user.phone,
      gender: user.gender,
      bio: catBio
    };
  }
}
