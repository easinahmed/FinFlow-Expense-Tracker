'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTransactions } from '@/hooks/use-transactions';
import { useCategories } from '@/hooks/use-categories';
import { TransactionForm } from '@/components/forms/transaction-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency, formatDate, PAYMENT_METHODS } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';
import { Transaction, TransactionFilters } from '@/types';
import { Plus, Search, Filter, MoreHorizontal, Edit2, Trash2, Download, ArrowUpDown, ChevronLeft, ChevronRight, SortAsc, SortDesc } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { transactions, total, totalPages, loading, fetchTransactions, createTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { categories, fetchCategories } = useCategories();

  const [showForm, setShowForm] = useState(false);
  const [editTxn, setEditTxn] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1, limit: 15, sortBy: 'date', sortOrder: 'desc',
  });

  useEffect(() => {
    fetchCategories();
    if (searchParams.get('action') === 'add') setShowForm(true);
  }, [fetchCategories, searchParams]);

  useEffect(() => {
    fetchTransactions(filters);
  }, [filters, fetchTransactions]);

  const handleFilter = (key: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const toggleSort = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleCreate = async (data: any) => {
    try {
      await createTransaction(data);
      toast({ title: t('transactionAdded') });
      fetchTransactions(filters);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editTxn) return;
    try {
      await updateTransaction(editTxn.id, data);
      toast({ title: t('transactionUpdated') });
      setEditTxn(null);
      fetchTransactions(filters);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTransaction(deleteId);
      toast({ title: t('transactionDeleted') });
      setDeleteId(null);
      fetchTransactions(filters);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleExport = async (type: string) => {
    const params = new URLSearchParams({ type });
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    window.open(`/api/export?${params}`, '_blank');
  };

  const SortButton = ({ field, label }: { field: string; label: string }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-1 hover:text-foreground text-muted-foreground font-medium text-xs uppercase tracking-wider">
      {label}
      {filters.sortBy === field ? (
        filters.sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
      ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{total} {t('transactions')} {t('total')}</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="w-4 h-4" /> {t('export')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv')}>{t('exportCSV')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>{t('exportJSON')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" className="gap-1.5" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> {t('addTransaction')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('searchTransactions')}
                className="pl-9"
                value={filters.search || ''}
                onChange={e => handleFilter('search', e.target.value)}
              />
            </div>
            <Select value={filters.type || 'ALL'} onValueChange={v => handleFilter('type', v)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('allTypes')}</SelectItem>
                <SelectItem value="INCOME">{t('income')}</SelectItem>
                <SelectItem value="EXPENSE">{t('expenses')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.categoryId || 'ALL'} onValueChange={v => handleFilter('categoryId', v === 'ALL' ? undefined : v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('allCategories')}</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.paymentMethod || 'ALL'} onValueChange={v => handleFilter('paymentMethod', v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('paymentMethod')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('allMethods')}</SelectItem>
                {PAYMENT_METHODS.map(pm => (
                  <SelectItem key={pm.value} value={pm.value}>{pm.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input type="date" className="w-38" value={filters.startDate || ''} onChange={e => handleFilter('startDate', e.target.value)} placeholder={t('from')} />
              <Input type="date" className="w-38" value={filters.endDate || ''} onChange={e => handleFilter('endDate', e.target.value)} placeholder={t('to')} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left"><SortButton field="date" label={t('date')} /></th>
                <th className="px-4 py-3 text-left"><SortButton field="description" label={t('description')} /></th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium text-xs uppercase tracking-wider">{t('category')}</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium text-xs uppercase tracking-wider">{t('method')}</th>
                <th className="px-4 py-3 text-right"><SortButton field="amount" label={t('amount')} /></th>
                <th className="px-4 py-3 text-center text-muted-foreground font-medium text-xs uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {[1,2,3,4,5,6].map(j => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    {t('adjustFiltersOrAdd')}
                  </td>
                </tr>
              ) : (
                transactions.map(txn => (
                  <tr key={txn.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(txn.date, 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{txn.description}</p>
                        {txn.note && <p className="text-xs text-muted-foreground">{txn.note}</p>}
                        {txn.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {txn.tags.map(tag => (
                              <span key={tag} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: txn.category.color }} />
                        <span className="text-sm">{txn.category.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{txn.paymentMethod.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn('text-sm font-semibold', txn.type === 'INCOME' ? 'text-income' : 'text-expense')}>
                        {txn.type === 'INCOME' ? '+' : '-'}{formatCurrency(txn.amount, txn.currency)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditTxn(txn)}>
                            <Edit2 className="w-4 h-4 mr-2" /> {t('edit')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(txn.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> {t('delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {t('page')} {filters.page} {t('of')} {totalPages} · {total} {t('results')}
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="w-8 h-8" disabled={(filters.page || 1) <= 1}
                onClick={() => handleFilter('page', (filters.page || 1) - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button key={page} variant={filters.page === page ? 'default' : 'outline'} size="icon"
                    className="w-8 h-8 text-xs" onClick={() => handleFilter('page', page)}>
                    {page}
                  </Button>
                );
              })}
              <Button variant="outline" size="icon" className="w-8 h-8" disabled={(filters.page || 1) >= totalPages}
                onClick={() => handleFilter('page', (filters.page || 1) + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Forms/Dialogs */}
      <TransactionForm open={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreate} />
      <TransactionForm open={!!editTxn} onClose={() => setEditTxn(null)} onSubmit={handleUpdate} editData={editTxn} />

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{t('deleteTransaction')}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t('cannotBeUndone')}</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>{t('cancel')}</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete}>{t('delete')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
