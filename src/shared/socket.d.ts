export type SocketRequest = {
  event: string;
  feed: string;
  product_ids: string[];
};

export type SocketResponse = {
  event?: string;
  version?: number;
  numLevels?: number;
  feed?: string;
  product_id?: string;
  product_ids?: string[];
  bids?: number[][];
  asks?: number[][];
};
