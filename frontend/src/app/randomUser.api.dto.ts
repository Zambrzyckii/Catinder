export interface RandomUserDto {
  results: Array<{
    name: {
      first: string;
      last: string;
    };
    phone: string;
    gender: string;
  }>;
}
