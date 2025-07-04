type UserDto = {
  id: number;
  firstName: string;
  lastName: string;
  maidenName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  birthDate: string;
  image: string;
  bloodGroup: string;
  height: number;
  weight: number;
  eyeColor: string;
  hair: {
    color: string;
    type: string;
  };
  ip: string;
  address: {
    address: string;
    city: string;
    state: string;
    stateCode: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    country: string;
  };
  macAddress: string;
  university: string;
  bank: {
    cardExpire: string;
    cardNumber: string;
    cardType: string;
    currency: string;
    iban: string;
  };
  company: {
    department: string;
    name: string;
    title: string;
    address: {
      address: string;
      city: string;
      state: string;
      stateCode: string;
      postalCode: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      country: string;
    };
  };
  ein: string;
  ssn: string;
  userAgent: string;
  crypto: {
    coin: string;
    wallet: string;
    network: string;
  };
  role: string;
};

export type GetUsersQueryParams = {
  limit?: number;
};

export type GetUsersResponseDto = {
  users: UserDto[];
  total: number;
  limit: number;
  skip: number;
};

export async function getUsers(
  queryParams: GetUsersQueryParams,
  signal: AbortSignal
): Promise<GetUsersResponseDto> {
  const url = new URL("https://dummyjson.com/users");

  if (queryParams.limit) {
    url.searchParams.append("limit", queryParams.limit.toString());
  }

  const response = await fetch(url, { signal });

  return (await response.json()) as GetUsersResponseDto;
}
