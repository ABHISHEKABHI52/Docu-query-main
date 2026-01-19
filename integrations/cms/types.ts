/**
 * Base interface for data items
 */
export interface WixDataItem {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
}

/**
 * Result type for data queries
 */
export interface DataResult<T> {
  items: T[];
  totalCount?: number;
}
