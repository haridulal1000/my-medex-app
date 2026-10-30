import { useQuery } from '@tanstack/react-query';
import {
  fetchCategories,
  fetchProviders,
  fetchServices,
} from '../api/services';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
}

export function useProviders() {
  return useQuery({ queryKey: ['providers'], queryFn: fetchProviders });
}

export function useServices() {
  return useQuery({ queryKey: ['services'], queryFn: fetchServices });
}