export const SUBSCRIBE = "SUBSCRIBE";

export const UNSUBSCRIBE = "UNSUBSCRIBE";

export type IncomingMessage =
  | {
      method: typeof SUBSCRIBE;
      params: string[];
      token?: string;
    }
  | {
      method: typeof UNSUBSCRIBE;
      params: string[];
    };