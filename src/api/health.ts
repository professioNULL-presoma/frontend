import { request } from './client'

export type Health = { status: string }

export const getHealth = (signal?: AbortSignal) => request<Health>('/health', { signal })
