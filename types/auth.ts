export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
};
