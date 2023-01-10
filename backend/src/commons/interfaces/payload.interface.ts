interface __Payload {
  id: string;
  nickName: string;
}

export interface IPayload extends __Payload {
  id: string;
  access_token: string;
  access_exp: number;
  refresh_token: string;
  refresh_exp: number;
}

export interface IPayloadSub extends __Payload {
  exp?: number;
  iat?: number;
}
