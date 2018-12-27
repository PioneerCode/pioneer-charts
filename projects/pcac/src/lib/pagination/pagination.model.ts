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
  totalItemsInCollection: number;

  /**
   * Hide or show
   */
  show: boolean;
}
