'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTransactions } from '@/hooks/use-transactions';
import { useCategories } from '@/hooks/use-categories';
import { TransactionForm } from '@/components/forms/transaction-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';
import { Transaction } from '@/types';
import { Plus, Search, MoreHorizontal, Edit2, Trash2, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ExpensesPage() {
  const searchParams = useSearchParams();
  const { transactions, total, totalPages, loading, fetchTransactions, createTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { categories, fetchCategories } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editTxn, setEditTxn] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchCategories(); if (searchParams.get('action') === 'add') setShowForm(true); }, [fetchCategories, searchParams]);
  useEffect(() => {
    fetchTransactions({ type: 'EXPENSE', search, categoryId: categoryId || undefined, page, limit: 15, sortBy: 'date', sortOrder: 'desc' });
  }, [search, categoryId, page, fetchTransactions]);

  const totalExpense = transactions.reduce((s, t) => s + t.amount, 0);

  const refresh = () => fetchTransactions({ type: 'EXPENSE', search, categoryId: categoryId || undefined, page, limit: 15, sortBy: 'date', sortOrder: 'desc' });

  const handleCreate = async (data: any) => {
    try { await createTransaction(data); toast({ title: 'Expense added!' }); refresh(); }
    catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };
  const handleUpdate = async (data: any) => {
    if (!editTxn) return;
    try { await updateTransaction(editTxn.id, data); toast({ title: 'Expense updated!' }); setEditTxn(null); refresh(); }
    catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteTransaction(deleteId); toast({ title: 'Expense deleted' }); setDeleteId(null); refresh(); }
    catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-expense/20 bg-expense/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-expense/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-expense" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Showing Results</p>
              <p className="text-xl font-bold font-display text-expense">{formatCurrency(totalExpense)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search expenses..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={categoryId || 'ALL'} onValueChange={v => { setCategoryId(v === 'ALL' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.filter(c => c.type !== 'INCOME').map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button className="gap-1.5 bg-expense hover:bg-expense/90" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Add Expense
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Date','Description','Category','Method','Amount',''].map((h, i) => (
                  <th key={i} className={`px-4 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({length:6}).map((_,i)=>(
                <tr key={i} className="border-b border-border/50">{[1,2,3,4,5,6].map(j=><td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse"/></td>)}</tr>
              )) : transactions.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">No expenses found.</td></tr>
              ) : transactions.map(txn => (
                <tr key={txn.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{formatDate(txn.date, 'MMM dd, yyyy')}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{txn.description}</p>
                    {txn.note && <p className="text-xs text-muted-foreground">{txn.note}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: txn.category.color }} />
                      <span className="text-sm">{txn.category.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{txn.paymentMethod.replace('_',' ')}</td>
                  <td className="px-4 py-3 text-right font-semibold text-expense">-{formatCurrency(txn.amount, txn.currency)}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="w-8 h-8"><MoreHorizontal className="w-4 h-4"/></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditTxn(txn)}><Edit2 className="w-4 h-4 mr-2"/>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(txn.id)}><Trash2 className="w-4 h-4 mr-2"/>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages} · {total} total</p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="w-8 h-8" disabled={page<=1} onClick={()=>setPage(p=>p-1)}><ChevronLeft className="w-4 h-4"/></Button>
              <Button variant="outline" size="icon" className="w-8 h-8" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}><ChevronRight className="w-4 h-4"/></Button>
            </div>
          </div>
        )}
      </Card>

      <TransactionForm open={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreate} defaultType="EXPENSE" />
      <TransactionForm open={!!editTxn} onClose={() => setEditTxn(null)} onSubmit={handleUpdate} editData={editTxn} defaultType="EXPENSE" />
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Expense?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This cannot be undone.</p>
          <div className="flex gap-2 mt-2"><Button variant="outline" className="flex-1" onClick={()=>setDeleteId(null)}>Cancel</Button><Button variant="destructive" className="flex-1" onClick={handleDelete}>Delete</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
