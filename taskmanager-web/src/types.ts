// src/types.ts

export interface Category {
  id: number;
  name: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  isDone: boolean;
  createdAt: string;
  categoryId?: number | null;
  categoryName?: string | null;
}

export interface TaskCreateDto {
  title: string;
  description?: string;
  categoryId?: number | null;
}
