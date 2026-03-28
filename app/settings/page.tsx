'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, UpdateProfileInput, changePasswordSchema, ChangePasswordInput } from '@/lib/validations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch, Separator, Avatar, AvatarFallback, AvatarImage } from '@/components/ui/misc';
import { toast } from '@/components/ui/toaster';
import { CURRENCIES } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Loader2, User, Palette, ShieldCheck, LogOut, Smartphone, Languages, Camera } from 'lucide-react';
import { useLanguage, LANGUAGES } from '@/lib/language-context';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(j => {
      if (j.data?.user) {
        setUser(j.data.user);
        setValue('name', j.data.user.name);
        setValue('currency', j.data.user.currency);
        if (j.data.user.avatar) {
          setAvatarPreview(j.data.user.avatar);
          setValue('avatar', j.data.user.avatar);
        }
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
      if (res.ok) { toast({ title: t('profileUpdated') || 'Profile updated successfully' }); }
      else { const j = await res.json(); throw new Error(j.error || j.message); }
    } catch (e: any) {
      toast({ title: t('error') || 'Error', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const onPasswordSubmit = async (data: ChangePasswordInput) => {
    setPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) { 
        toast({ title: 'Password updated successfully' }); 
        resetPassword();
      } else { 
        const j = await res.json(); throw new Error(j.error || j.message); 
      }
    } catch (e: any) {
      toast({ title: t('error') || 'Error', description: e.message, variant: 'destructive' });
    } finally { setPasswordLoading(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please choose an image under 2MB', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarPreview(result);
      setValue('avatar', result);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <div className="space-y-8 max-w-2xl pb-20">

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <CardTitle className="text-base">{t('profile')}</CardTitle>
          </div>
          <CardDescription>{t('manageProfile')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="w-16 h-16 border bg-muted">
                <AvatarImage src={avatarPreview || ''} alt={user?.name || ''} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-primary mt-1 select-none">Click avatar to change photo</p>
            </div>
          </div>
          <Separator />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('name')}</Label>
              <Input {...register('name')} className={errors.name ? 'border-destructive' : ''} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('currency')}</Label>
              <Select defaultValue={user?.currency || 'USD'} onValueChange={v => setValue('currency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('saving')}</> : t('saveChanges')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4" />
            <CardTitle className="text-base">{t('language')}</CardTitle>
          </div>
          <CardDescription>{t('selectLanguage')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map(lang => (
              <button
                key={lang.value}
                onClick={() => setLanguage(lang.value)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  language === lang.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <p className="font-semibold text-sm">{lang.nativeLabel}</p>
                  <p className="text-xs text-muted-foreground">{lang.label}</p>
                </div>
                {language === lang.value && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <CardTitle className="text-base">{t('appearance')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{t('darkMode')}</p>
              <p className="text-xs text-muted-foreground">{t('switchTheme')}</p>
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
            <CardTitle className="text-base">{t('mobileApp')}</CardTitle>
          </div>
          <CardDescription>{t('installFinFlow')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium">{t('howToInstall')}</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>{t('installStep1')}</li>
              <li>{t('installStep2')}</li>
              <li>{t('installStep3')}</li>
              <li>{t('installStep4')}</li>
              <li>{t('installStep5')}</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <CardTitle className="text-base">{t('security')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div>
              <p className="text-sm font-medium">{t('accountEmail') || 'Account Email'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <CardTitle className="text-base">Change Password</CardTitle>
          </div>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <Input type="password" {...registerPassword('currentPassword')} className={passwordErrors.currentPassword ? 'border-destructive' : ''} />
              {passwordErrors.currentPassword && <p className="text-xs text-destructive">{passwordErrors.currentPassword.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input type="password" {...registerPassword('newPassword')} className={passwordErrors.newPassword ? 'border-destructive' : ''} />
              {passwordErrors.newPassword && <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Confirm New Password</Label>
              <Input type="password" {...registerPassword('confirmPassword')} className={passwordErrors.confirmPassword ? 'border-destructive' : ''} />
              {passwordErrors.confirmPassword && <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" disabled={passwordLoading} variant="outline" className="w-full sm:w-auto">
              {passwordLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="border-destructive/30 mb-5">
        <CardHeader>
          <CardTitle className="text-base text-destructive">{t('signOut')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleLogout} className="gap-1.5">
            <LogOut className="w-4 h-4" /> {t('signOutOf')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
