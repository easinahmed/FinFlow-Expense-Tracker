'use client';

import { useEffect, useState } from 'react';
import { useTransactions } from '@/hooks/use-transactions';
import { TransactionForm } from '@/components/forms/transaction-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';
import { Transaction } from '@/types';
import { Plus, Search, MoreHorizontal, Edit2, Trash2, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function IncomePage() {
  const { transactions, total, totalPages, loading, fetchTransactions, createTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [editTxn, setEditTxn] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTransactions({ type: 'INCOME', search, page, limit: 15, sortBy: 'date', sortOrder: 'desc' });
  }, [search, page, fetchTransactions]);

  const totalIncome = transactions.reduce((s, t) => s + t.amount, 0);

  const handleCreate = async (data: any) => {
    try { await createTransaction(data); toast({ title: 'Income added!' }); fetchTransactions({ type: 'INCOME', search, page, limit: 15, sortBy: 'date', sortOrder: 'desc' }); }
    catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };
  const handleUpdate = async (data: any) => {
    if (!editTxn) return;
    try { await updateTransaction(editTxn.id, data); toast({ title: 'Income updated!' }); setEditTxn(null); fetchTransactions({ type: 'INCOME', search, page, limit: 15, sortBy: 'date', sortOrder: 'desc' }); }
    catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteTransaction(deleteId); toast({ title: 'Income deleted' }); setDeleteId(null); fetchTransactions({ type: 'INCOME', search, page, limit: 15, sortBy: 'date', sortOrder: 'desc' }); }
    catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="sm:col-span-1 border-income/20 bg-income/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-income/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-income" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Showing Results</p>
              <p className="text-xl font-bold font-display text-income">{formatCurrency(totalIncome)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search income..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Button className="gap-1.5 bg-income hover:bg-income/90" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Add Income
        </Button>
      </div>

      {/* List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs text-muted-foreground font-semibold uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground font-semibold uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground font-semibold uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground font-semibold uppercase tracking-wider">Method</th>
                <th className="px-4 py-3 text-right text-xs text-muted-foreground font-semibold uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {[1,2,3,4,5,6].map(j => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">No income records found.</td></tr>
              ) : transactions.map(txn => (
                <tr key={txn.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(txn.date, 'MMM dd, yyyy')}</td>
                  <td className="px-4 py-3 text-sm font-medium">{txn.description}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: txn.category.color }} />
                      <span className="text-sm">{txn.category.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{txn.paymentMethod.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-right font-semibold text-income">+{formatCurrency(txn.amount, txn.currency)}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditTxn(txn)}><Edit2 className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(txn.id)}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
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
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="w-8 h-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" className="w-8 h-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </Card>

      <TransactionForm open={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreate} defaultType="INCOME" />
      <TransactionForm open={!!editTxn} onClose={() => setEditTxn(null)} onSubmit={handleUpdate} editData={editTxn} defaultType="INCOME" />
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Income Record?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <div className="flex gap-2 mt-2"><Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button><Button variant="destructive" className="flex-1" onClick={handleDelete}>Delete</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
