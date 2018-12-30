export interface IPcacPaginationConfig {
  /**
   * What page are we currently on?
   */
  currentPageIndex: number;
  /**
   * How many records do we who per page
   */
  countPerPage: number;

  /**
   * How many items are in the entire collection
   */
  totalItemsInCollection: PcacPaginationPageSizeEnum;

  /**
   * Hide or show
   */
  show: boolean;
}

export enum PcacPaginationPageSizeEnum {
  Ten = 10,
  TwentyFive = 25,
  Fifty = 50,
  OneHundred = 100
}
