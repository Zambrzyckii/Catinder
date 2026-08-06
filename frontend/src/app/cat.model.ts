export interface CatProfile {
  id: string;
  url: string;
  name?: string;
  surname?: string;
  phonenumber?: string;
  gender?: string;
  bio?: string;
}

export interface Cat extends CatProfile {
  match: boolean;
}
