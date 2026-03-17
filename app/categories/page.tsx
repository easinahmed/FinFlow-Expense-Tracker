'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCategories } from '@/hooks/use-categories';
import { categorySchema, CategoryInput } from '@/lib/validations';
import { Category } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toaster';
import { Plus, Edit2, Trash2, Lock, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

const ICON_OPTIONS = ['tag','utensils','car','shopping-bag','zap','book-open','heart','film','plane','briefcase','laptop','trending-up','gift','store','home','coffee','music','gamepad','dumbbell','pill'];
const COLOR_OPTIONS = ['#6366f1','#22c55e','#ef4444','#f59e0b','#3b82f6','#ec4899','#8b5cf6','#06b6d4','#10b981','#f97316','#84cc16','#14b8a6'];

function CategoryForm({ category, onSubmit, onClose }: { category?: Category; onSubmit: (d: CategoryInput) => Promise<void>; onClose: () => void }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: { name: category?.name || '', icon: category?.icon || 'tag', color: category?.color || '#6366f1', type: category?.type || 'BOTH' },
  });
  const color = watch('color');
  const icon = watch('icon');

  const onFormSubmit = async (data: CategoryInput) => {
    setLoading(true);
    try { await onSubmit(data); onClose(); }
    catch (e: any) { toast({ title: t('error'), description: e.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit as any)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t('name')}</Label>
        <Input placeholder={t('name')} {...register('name')} className={errors.name ? 'border-destructive' : ''} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>{t('type')}</Label>
        <Select defaultValue={category?.type || 'BOTH'} onValueChange={v => setValue('type', v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="BOTH">{t('both')}</SelectItem>
            <SelectItem value="INCOME">{t('income')}</SelectItem>
            <SelectItem value="EXPENSE">{t('expenses')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>{t('color')}</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map(c => (
            <button key={c} type="button" onClick={() => setValue('color', c)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }} />
          ))}
          <Input type="color" value={color} onChange={e => setValue('color', e.target.value)} className="w-7 h-7 p-0 rounded-full border-0 cursor-pointer" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>{t('iconName')}</Label>
        <div className="flex gap-2">
          <Input placeholder={t('iconPlaceholder')} {...register('icon')} className="flex-1" />
        </div>
        <p className="text-xs text-muted-foreground">{t('iconHint')}</p>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>{t('cancel')}</Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {category ? t('updateCategory') : t('createCategory')}
        </Button>
      </div>
    </form>
  );
}

export default function CategoriesPage() {
  const { t } = useLanguage();
  const { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const incomeCategories = categories.filter(c => c.type === 'INCOME');
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');
  const bothCategories = categories.filter(c => c.type === 'BOTH');

  const handleCreate = async (data: CategoryInput) => {
    await createCategory(data);
    toast({ title: t('categoryCreated') });
    setShowForm(false);
  };

  const handleUpdate = async (data: CategoryInput) => {
    if (!editCat) return;
    await updateCategory(editCat.id, data);
    toast({ title: t('categoryUpdated') });
    setEditCat(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteCategory(deleteId); toast({ title: t('categoryDeleted') }); setDeleteId(null); }
    catch (e: any) { toast({ title: t('error'), description: e.message, variant: 'destructive' }); }
  };

  const CategoryGroup = ({ title, cats, badge }: { title: string; cats: Category[]; badge: string }) => (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        <Badge variant="secondary" className="text-xs">{badge}</Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cats.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
              </div>
              <div>
                <p className="text-sm font-medium">{cat.name}</p>
                {cat.isDefault && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="w-2.5 h-2.5" /> {t('default')}
                  </div>
                )}
              </div>
            </div>
            {!cat.isDefault && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setEditCat(cat)}>
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(cat.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> {t('newCategory')}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({length:8}).map((_,i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {incomeCategories.length > 0 && <CategoryGroup title={t('incomeCategories')} cats={incomeCategories} badge={`${incomeCategories.length}`} />}
          {expenseCategories.length > 0 && <CategoryGroup title={t('expenseCategories')} cats={expenseCategories} badge={`${expenseCategories.length}`} />}
          {bothCategories.length > 0 && <CategoryGroup title={t('generalCategories')} cats={bothCategories} badge={`${bothCategories.length}`} />}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{t('newCategory')}</DialogTitle></DialogHeader>
          <CategoryForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editCat} onOpenChange={() => setEditCat(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{t('editCategory')}</DialogTitle></DialogHeader>
          {editCat && <CategoryForm category={editCat} onSubmit={handleUpdate} onClose={() => setEditCat(null)} />}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{t('deleteCategoryTitle')}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t('deleteCategoryDesc')}</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>{t('cancel')}</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete}>{t('delete')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
