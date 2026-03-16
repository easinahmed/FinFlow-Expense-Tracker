'use client';

import { useState, useCallback } from 'react';
import { Category } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCategories(json.data);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = async (data: any) => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    await fetchCategories();
    return json.data;
  };

  const updateCategory = async (id: string, data: any) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    await fetchCategories();
    return json.data;
  };

  const deleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    await fetchCategories();
  };

  return { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory };
}
