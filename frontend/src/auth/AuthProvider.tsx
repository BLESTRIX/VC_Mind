import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  FileSearch,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';

import { setApiAccessToken } from '../api/client';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

type AuthValue = {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setApiAccessToken(data.session?.access_token);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setApiAccessToken(nextSession?.access_token);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      session,
      loading,
      signOut: async () => {
        await supabase?.auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const trustPoints = [
  {
    icon: FileSearch,
    title: 'Evidence-led diligence',
    description: 'Trace every investment claim back to its source.',
  },
  {
    icon: BarChart3,
    title: 'Consistent scoring',
    description: 'Evaluate opportunities against your investment thesis.',
  },
  {
    icon: ShieldCheck,
    title: 'Decision integrity',
    description: 'Keep review history, memos, and decisions in one place.',
  },
] as const;

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || busy) return;

    setBusy(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) setError(authError.message);
    } catch {
      setError('We could not reach the sign-in service. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  if (!hasSupabaseConfig) return <ConfigurationRequired />;

  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[1.08fr_0.92fr]">
      <BrandPanel />

      <section className="relative flex min-h-dvh items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent lg:hidden" />

        <div className="w-full max-w-[420px]">
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <BrandMark />
            <div>
              <div className="text-sm font-semibold tracking-tight text-foreground">VC Mind</div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Diligence workspace
              </div>
            </div>
          </div>

          <div className="mb-7">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <LockKeyhole className="h-3 w-3 text-primary" />
              Authorized access only
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
              Welcome back
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sign in to continue to your investment workspace.
            </p>
          </div>

          <form className="space-y-5" onSubmit={submit} noValidate={false}>
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@firm.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={busy}
                required
                autoFocus
                className="h-11 bg-card px-3.5"
                aria-describedby={error ? 'sign-in-error' : undefined}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={busy}
                  required
                  className="h-11 bg-card px-3.5 pr-11"
                  aria-describedby={error ? 'sign-in-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  disabled={busy}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring disabled:pointer-events-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                id="sign-in-error"
                role="alert"
                aria-live="polite"
                className="flex gap-2.5 rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" size="lg" className="h-11 w-full" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 border-t border-border pt-6 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            Secure access for your investment team
          </div>
        </div>
      </section>
    </main>
  );
}

function BrandPanel() {
  return (
    <aside className="relative hidden min-h-dvh overflow-hidden bg-[oklch(0.2_0.055_265)] px-12 py-10 text-white lg:flex lg:flex-col xl:px-16 xl:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,oklch(0.48_0.15_265/0.34),transparent_37%),radial-gradient(circle_at_82%_86%,oklch(0.56_0.11_170/0.16),transparent_34%)]" />
      <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative z-10 flex items-center gap-3">
        <BrandMark inverse />
        <div>
          <div className="text-sm font-semibold tracking-tight">VC Mind</div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/55">
            Diligence workspace
          </div>
        </div>
      </div>

      <div className="relative z-10 my-auto max-w-xl py-14">
        <div className="mb-5 h-px w-10 bg-white/35" />
        <h2 className="max-w-lg text-4xl font-semibold leading-[1.13] tracking-[-0.035em] xl:text-[44px]">
          Investment decisions, grounded in evidence.
        </h2>
        <p className="mt-5 max-w-lg text-[15px] leading-7 text-white/65">
          A focused workspace for reviewing opportunities, validating claims, and reaching
          confident investment decisions.
        </p>

        <div className="mt-11 grid max-w-lg gap-5">
          {trustPoints.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-3.5">
              <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/12 bg-white/[0.07]">
                <Icon className="h-4 w-4 text-white/80" />
              </div>
              <div>
                <div className="text-sm font-medium text-white/95">{title}</div>
                <div className="mt-0.5 text-xs leading-5 text-white/50">{description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 text-[11px] text-white/40">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Built for disciplined venture diligence
      </div>
    </aside>
  );
}

function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <div
      className={
        inverse
          ? 'grid h-8 w-8 place-items-center rounded-md border border-white/15 bg-white/10 text-white shadow-sm'
          : 'grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm'
      }
      aria-hidden="true"
    >
      <span className="text-sm font-semibold">V</span>
    </div>
  );
}

function ConfigurationRequired() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-5 py-10">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-7 text-center shadow-sm sm:p-9">
        <div className="mx-auto mb-5 w-fit">
          <BrandMark />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Connect authentication</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          VC Mind needs Supabase credentials before team members can sign in.
        </p>
        <div className="mt-6 rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-left text-xs leading-5 text-warning-foreground">
          Configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, then
          restart the frontend.
        </div>
      </div>
    </main>
  );
}
