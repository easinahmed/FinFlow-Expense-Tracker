'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionInput } from '@/lib/validations';
import { useCategories } from '@/hooks/use-categories';
import { PAYMENT_METHODS } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Transaction } from '@/types';
import { useLanguage } from '@/lib/language-context';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionInput) => Promise<void>;
  defaultType?: 'INCOME' | 'EXPENSE';
  editData?: Transaction | null;
}

export function TransactionForm({ open, onClose, onSubmit, defaultType = 'EXPENSE', editData }: TransactionFormProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const { categories, fetchCategories } = useCategories();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      type: defaultType,
      date: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'CASH',
      currency: 'USD',
      tags: [],
      isRecurring: false,
    },
  });

  const txType = watch('type');

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    if (editData) {
      reset({
        type: editData.type,
        amount: editData.amount,
        description: editData.description,
        note: editData.note || '',
        date: format(new Date(editData.date), 'yyyy-MM-dd'),
        paymentMethod: editData.paymentMethod,
        currency: editData.currency,
        tags: editData.tags,
        isRecurring: editData.isRecurring,
        recurringFreq: editData.recurringFreq,
        categoryId: editData.categoryId,
      });
      setTags(editData.tags);
    } else {
      reset({ type: defaultType, date: format(new Date(), 'yyyy-MM-dd'), paymentMethod: 'CASH', currency: 'USD', tags: [], isRecurring: false });
      setTags([]);
    }
  }, [editData, defaultType, reset]);

  const filteredCategories = categories.filter(c => c.type === txType || c.type === 'BOTH');

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed];
      setTags(newTags);
      setValue('tags', newTags);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const handleFormSubmit = async (data: TransactionInput) => {
    setLoading(true);
    try {
      await onSubmit({ ...data, tags });
      reset();
      setTags([]);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editData ? t('editTransaction') : t('addTransaction')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2">
            {(['EXPENSE', 'INCOME'] as const).map(tx => (
              <button
                key={tx}
                type="button"
                onClick={() => setValue('type', tx)}
                className={cn(
                  'py-2.5 rounded-xl text-sm font-semibold border transition-all',
                  txType === tx
                    ? tx === 'INCOME'
                      ? 'bg-income/10 border-income text-income'
                      : 'bg-expense/10 border-expense text-expense'
                    : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80'
                )}
              >
                {tx === 'INCOME' ? t('addIncome') : t('addExpense')}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label>{t('amount')}</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
              className={errors.amount ? 'border-destructive' : ''}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>{t('description')}</Label>
            <Input placeholder={t('whatWasThisFor')} {...register('description')} className={errors.description ? 'border-destructive' : ''} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>{t('category')}</Label>
            <Select onValueChange={v => setValue('categoryId', v)} defaultValue={editData?.categoryId}>
              <SelectTrigger className={errors.categoryId ? 'border-destructive' : ''}>
                <SelectValue placeholder={t('selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t('date')}</Label>
              <Input type="date" {...register('date')} className={errors.date ? 'border-destructive' : ''} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('paymentMethod')}</Label>
              <Select onValueChange={v => setValue('paymentMethod', v as any)} defaultValue={editData?.paymentMethod || 'CASH'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(pm => (
                    <SelectItem key={pm.value} value={pm.value}>{pm.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label>{t('note')} <span className="text-muted-foreground text-xs">({t('optional')})</span></Label>
            <Input placeholder={t('additionalNotes')} {...register('note')} />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label>{t('tags')}</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder={t('addTag')}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>{t('add')}</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-lg">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>{t('cancel')}</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('saving')}</> : editData ? t('update') : t('addTransaction')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
