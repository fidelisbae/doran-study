interface __Payload {
  id: string;
  nickName: string;
}

export interface IPayloadSub extends __Payload {
  exp?: number;
  iat?: number;
}
