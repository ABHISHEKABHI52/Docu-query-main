import { WixDataItem, DataResult } from "./types";

// In-memory storage for demo purposes
const storage: Record<string, Record<string, any>> = {};

/**
 * Get storage for a collection (uses localStorage in browser)
 */
function getCollectionStorage<T>(collectionId: string): T[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`docu-query-${collectionId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
  }
  return storage[collectionId] || [];
}

/**
 * Save storage for a collection
 */
function saveCollectionStorage<T>(collectionId: string, items: T[]): void {
  storage[collectionId] = items;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`docu-query-${collectionId}`, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
}

/**
 * Generic CRUD Service class for local storage
 * Provides type-safe CRUD operations with error handling
 */
export class BaseCrudService {
  /**
   * Creates a new item in the collection
   */
  static async create<T extends WixDataItem>(
    collectionId: string,
    itemData: Partial<T> | Record<string, unknown>,
    _multiReferences?: Record<string, any>
  ): Promise<T> {
    try {
      const items = getCollectionStorage<T>(collectionId);
      const newItem = {
        ...itemData,
        _id: itemData._id || crypto.randomUUID(),
        _createdDate: new Date(),
        _updatedDate: new Date(),
      } as T;
      
      items.push(newItem);
      saveCollectionStorage(collectionId, items);
      
      return newItem;
    } catch (error) {
      console.error(`Error creating ${collectionId}:`, error);
      throw new Error(
        error instanceof Error ? error.message : `Failed to create ${collectionId}`
      );
    }
  }

  /**
   * Retrieves all items from the collection
   */
  static async getAll<T extends WixDataItem>(
    collectionId: string,
    _includeReferencedItems?: string[]
  ): Promise<DataResult<T>> {
    try {
      const items = getCollectionStorage<T>(collectionId);
      return { items, totalCount: items.length };
    } catch (error) {
      console.error(`Error fetching ${collectionId}s:`, error);
      throw new Error(
        error instanceof Error ? error.message : `Failed to fetch ${collectionId}s`
      );
    }
  }

  /**
   * Retrieves a single item by ID
   */
  static async getById<T extends WixDataItem>(
    collectionId: string,
    itemId: string,
    _includeReferencedItems?: string[]
  ): Promise<T | null> {
    try {
      const items = getCollectionStorage<T>(collectionId);
      const item = items.find(i => i._id === itemId);
      return item || null;
    } catch (error) {
      console.error(`Error fetching ${collectionId} by ID:`, error);
      throw new Error(
        error instanceof Error ? error.message : `Failed to fetch ${collectionId}`
      );
    }
  }

  /**
   * Updates an existing item
   */
  static async update<T extends WixDataItem>(
    collectionId: string, 
    itemData: Partial<T> & { _id: string }
  ): Promise<T> {
    try {
      if (!itemData._id) {
        throw new Error(`${collectionId} ID is required for update`);
      }

      const items = getCollectionStorage<T>(collectionId);
      const index = items.findIndex(i => i._id === itemData._id);
      
      if (index === -1) {
        throw new Error(`${collectionId} with ID ${itemData._id} not found`);
      }

      const updatedItem = {
        ...items[index],
        ...itemData,
        _updatedDate: new Date(),
      } as T;
      
      items[index] = updatedItem;
      saveCollectionStorage(collectionId, items);
      
      return updatedItem;
    } catch (error) {
      console.error(`Error updating ${collectionId}:`, error);
      throw new Error(
        error instanceof Error ? error.message : `Failed to update ${collectionId}`
      );
    }
  }

  /**
   * Deletes an item by ID
   */
  static async delete<T extends WixDataItem>(
    collectionId: string, 
    itemId: string
  ): Promise<T> {
    try {
      if (!itemId) {
        throw new Error(`${collectionId} ID is required for deletion`);
      }

      const items = getCollectionStorage<T>(collectionId);
      const index = items.findIndex(i => i._id === itemId);
      
      if (index === -1) {
        throw new Error(`${collectionId} with ID ${itemId} not found`);
      }

      const deletedItem = items[index];
      items.splice(index, 1);
      saveCollectionStorage(collectionId, items);
      
      return deletedItem as T;
    } catch (error) {
      console.error(`Error deleting ${collectionId}:`, error);
      throw new Error(
        error instanceof Error ? error.message : `Failed to delete ${collectionId}`
      );
    }
  }
}
