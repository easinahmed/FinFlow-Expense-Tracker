'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, UpdateProfileInput } from '@/lib/validations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/misc';
import { Separator } from '@/components/ui/misc';
import { toast } from '@/components/ui/toaster';
import { Avatar, AvatarFallback } from '@/components/ui/misc';
import { CURRENCIES } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Loader2, User, Palette, Shield, Bell, LogOut, Smartphone } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
  });

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(j => {
      if (j.data?.user) {
        setUser(j.data.user);
        setValue('name', j.data.user.name);
        setValue('currency', j.data.user.currency);
      }
    });
  }, [setValue]);

  const onSubmit = async (data: UpdateProfileInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) { toast({ title: 'Profile updated!' }); }
      else { const j = await res.json(); throw new Error(j.error); }
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <CardTitle className="text-base">Profile</CardTitle>
          </div>
          <CardDescription>Manage your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Separator />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input {...register('name')} className={errors.name ? 'border-destructive' : ''} />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select defaultValue={user?.currency || 'USD'} onValueChange={v => setValue('currency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <CardTitle className="text-base">Appearance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={c => setTheme(c ? 'dark' : 'light')} />
          </div>
        </CardContent>
      </Card>

      {/* PWA Install */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <CardTitle className="text-base">Mobile App</CardTitle>
          </div>
          <CardDescription>Install FinFlow as a native-like Android app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium">How to install on Android:</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open FinFlow in Chrome on Android</li>
              <li>Tap the three-dot menu (⋮) in the top right</li>
              <li>Select "Add to Home Screen"</li>
              <li>Tap "Add" in the dialog that appears</li>
              <li>FinFlow will appear on your home screen like a native app!</li>
            </ol>
          </div>
          <p className="text-xs text-muted-foreground">
            Features: Works offline, push notifications, native navigation, no browser bar.
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <CardTitle className="text-base">Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div>
              <p className="text-sm font-medium">Account Email</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">JWT authentication · bcrypt password hashing · HttpOnly cookies</p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Sign Out</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleLogout} className="gap-1.5">
            <LogOut className="w-4 h-4" /> Sign Out of FinFlow
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
