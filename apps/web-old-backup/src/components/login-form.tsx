'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

function LoginFormContent({
  className,
  defaultToRegister = false,
  ...props
}: Omit<React.ComponentProps<"div">, "ref"> & { defaultToRegister?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { login, register } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(defaultToRegister);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        // Register logic
        const result = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        if (result.success) {
          router.push(redirectUrl);
        } else {
          toast.error(result.message || 'Kayıt başarısız');
        }
      } else {
        // Login logic
        const result = await login({
          email: formData.email,
          password: formData.password,
        });

        if (result.success) {
          router.push(redirectUrl);
        } else {
          toast.error(result.message || 'Giriş başarısız');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">
                  {isRegisterMode ? 'Hesap Oluştur' : 'Hoş Geldiniz'}
                </h1>
                <p className="text-muted-foreground text-balance">
                  {isRegisterMode
                    ? 'Basak Pastanesi hesabınızı oluşturun'
                    : 'Basak Pastanesi hesabınıza giriş yapın'
                  }
                </p>
              </div>
              {isRegisterMode && (
                <Field>
                  <FieldLabel htmlFor="name">Ad Soyad</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Adınız Soyadınız"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="email">E-posta</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Şifre</FieldLabel>
                  {!isRegisterMode && (
                    <a
                      href="/forgot-password"
                      className="ml-auto text-sm underline-offset-2 hover:underline"
                    >
                      Şifrenizi mi unuttunuz?
                    </a>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading
                    ? 'İşleniyor...'
                    : isRegisterMode
                      ? 'Kayıt Ol'
                      : 'Giriş Yap'
                  }
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Veya şununla devam edin
              </FieldSeparator>
              <Field className="grid grid-cols-3 gap-4">
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Apple</span>
                </Button>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Google</span>
                </Button>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Meta</span>
                </Button>
              </Field>
              <FieldDescription className="text-center">
                {isRegisterMode ? (
                  <>
                    Zaten hesabınız var mı?{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(false)}
                      className="underline"
                    >
                      Giriş Yap
                    </button>
                  </>
                ) : (
                  <>
                    Hesabınız yok mu?{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(true)}
                      className="underline"
                    >
                      Kayıt Ol
                    </button>
                  </>
                )}
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/assets/login-banner.webp"
              alt="Basak Pastanesi - Özel Reçineli Çam Balı"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Devam ederek <a href="/terms" className="underline">Kullanım Koşulları</a>{" "}
        ve <a href="/privacy" className="underline">Gizlilik Politikası</a>'nı kabul etmiş olursunuz.
      </FieldDescription>
    </div>
  )
}

export function LoginForm({
  className,
  defaultToRegister,
  ...props
}: React.ComponentProps<"div"> & { defaultToRegister?: boolean }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    }>
      <LoginFormContent className={className} defaultToRegister={defaultToRegister} {...props} />
    </Suspense>
  );
}
