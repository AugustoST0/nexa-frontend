import { Injectable } from '@angular/core';

export enum StorageKey {
  ACCESS_TOKEN = 'accessToken',
  REFRESH_TOKEN = 'refreshToken',
  USER_PREFERENCES = 'userPreferences',
  THEME = 'theme',
}

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {

  set<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return null;
    }
  }

  getString(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading string from localStorage key "${key}":`, error);
      return null;
    }
  }

  setString(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error saving string to localStorage key "${key}":`, error);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  setAccessToken(token: string): void {
    this.setString(StorageKey.ACCESS_TOKEN, token);
  }

  getAccessToken(): string | null {
    return this.getString(StorageKey.ACCESS_TOKEN);
  }

  setRefreshToken(token: string): void {
    this.setString(StorageKey.REFRESH_TOKEN, token);
  }

  getRefreshToken(): string | null {
    return this.getString(StorageKey.REFRESH_TOKEN);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  removeTokens(): void {
    this.remove(StorageKey.ACCESS_TOKEN);
    this.remove(StorageKey.REFRESH_TOKEN);
  }

  hasTokens(): boolean {
    return this.has(StorageKey.ACCESS_TOKEN) && this.has(StorageKey.REFRESH_TOKEN);
  }
}