import { z } from 'zod';
import { api } from './client';
import {
  CategoryWithChildrenSchema,
  ProviderSchema,
  ServiceSchema,
} from './schemas';

export async function fetchCategories() {
  const { data } = await api.get('/category/active');
  return z.array(CategoryWithChildrenSchema).parse(data);
}

export async function fetchProviders() {
  const { data } = await api.get('/provider');
  return z.array(ProviderSchema).parse(data);
}

export async function fetchServices() {
  const { data } = await api.get('/service');
  return z.array(ServiceSchema).parse(data);
}