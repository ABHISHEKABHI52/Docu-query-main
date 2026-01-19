/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: knowledgebasedocuments
 * Interface for KnowledgeBaseDocuments
 */
export interface KnowledgeBaseDocuments {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  documentTitle?: string;
  /** @wixFieldType text */
  fileType?: string;
  /** @wixFieldType datetime */
  lastUpdated?: Date | string;
  /** @wixFieldType url */
  documentUrl?: string;
  /** @wixFieldType text */
  googleDriveId?: string;
  /** @wixFieldType number */
  fileSize?: number;
}


/**
 * Collection ID: queryhistory
 * Interface for QueryHistory
 */
export interface QueryHistory {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  userQuery?: string;
  /** @wixFieldType text */
  aiAnswer?: string;
  /** @wixFieldType datetime */
  queryTimestamp?: Date | string;
  /** @wixFieldType text */
  sourceDocuments?: string;
  /** @wixFieldType number */
  feedbackRating?: number;
}
