import { api } from "./client";

export async function getHealth() {
  return await api.get<{
    success: boolean;
    message: string;
    timestamp: string;
    version: string;
  }>('/health', undefined, {
    skipAuth: true,
    timeout: 120000, // 2 minutes timeout
  });
}