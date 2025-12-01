// src/api.ts
import axios from "axios";
import type { Task, TaskCreateDto, Category } from "./types";

const API_BASE_URL = "https://localhost:7002/api"; // puerto de tu backend .NET

const api = axios.create({
  baseURL: API_BASE_URL,
});

// --------- TASKS ----------
export async function getTasks(): Promise<Task[]> {
  const res = await api.get<Task[]>("/Tasks");
  return res.data;
}

export async function createTask(dto: TaskCreateDto): Promise<Task> {
  const res = await api.post<Task>("/Tasks", dto);
  return res.data;
}

export async function updateTask(id: number, dto: TaskCreateDto): Promise<Task> {
  const res = await api.put<Task>(`/Tasks/${id}`, dto);
  return res.data;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/Tasks/${id}`);
}

// --------- CATEGORIES ----------
export async function getCategories(): Promise<Category[]> {
  const res = await api.get<Category[]>("/Categories");
  return res.data;
}

export async function createCategory(name: string): Promise<Category> {
  const res = await api.post<Category>("/Categories", { name });
  return res.data;
}
