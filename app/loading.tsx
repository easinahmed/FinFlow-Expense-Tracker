import { Loader2, TrendingUp } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-8 bg-card rounded-3xl shadow-2xl border border-border/50 animate-in zoom-in-95 duration-500">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <TrendingUp className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1.5 shadow-sm border border-border">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
        </div>
        <div className="space-y-1 text-center">
          <h3 className="text-xl font-bold font-display tracking-tight text-foreground">
            FinFlow
          </h3>
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading your financial data...
          </p>
        </div>
      </div>
    </div>
  );
}
