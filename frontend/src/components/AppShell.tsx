import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Briefcase, PlusCircle, LogOut, ChevronRight } from "lucide-react";
import { useAuth, SignIn } from "@/auth/AuthProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LoadingBlock } from "@/components/vc/primitives";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Deal Flow", icon: Briefcase, match: (p: string) => p === "/" || p.startsWith("/applications") },
  { to: "/applications/new", label: "New Application", icon: PlusCircle, match: (p: string) => p === "/applications/new" },
] as const;

export function AppShell({
  children,
  breadcrumbs,
  pageActions,
}: {
  children: ReactNode;
  breadcrumbs?: Array<{ label: string; to?: string }>;
  pageActions?: ReactNode;
}) {
  const { session, loading, signOut } = useAuth();

  if (loading)
    return (
      <main className="grid min-h-dvh place-items-center bg-background">
        <LoadingBlock label="Loading session…" />
      </main>
    );
  if (!session) return <SignIn />;

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-background">
        <AppSidebar email={session.user.email ?? ""} onSignOut={() => void signOut()} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar breadcrumbs={breadcrumbs} pageActions={pageActions} />
          <main className="flex-1 overflow-x-hidden">
            <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppSidebar({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
            <span className="text-sm font-semibold">V</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight">VC Mind</div>
              <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                Diligence workspace
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active = item.match(pathname);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                      <Link to={item.to} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <div className={cn("flex items-center gap-2 rounded-md p-2", collapsed && "justify-center")}>
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium uppercase text-muted-foreground">
            {email.slice(0, 1) || "?"}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium">{email}</div>
                <div className="text-[10px] text-muted-foreground">Signed in</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSignOut}
                aria-label="Sign out"
                className="h-7 w-7"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function TopBar({
  breadcrumbs,
  pageActions,
}: {
  breadcrumbs?: Array<{ label: string; to?: string }>;
  pageActions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-border/70 bg-background/85 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:px-6">
      <SidebarTrigger className="h-8 w-8" />
      <Separator orientation="vertical" className="h-5" />
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 flex-1 items-center gap-1 text-xs text-muted-foreground"
      >
        {(breadcrumbs ?? [{ label: "Deal Flow", to: "/" }]).map((c, i, arr) => (
          <span key={i} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/60" />}
            {c.to && i < arr.length - 1 ? (
              <Link
                to={c.to}
                className="truncate rounded px-1 py-0.5 hover:bg-accent hover:text-foreground"
              >
                {c.label}
              </Link>
            ) : (
              <span className={cn("truncate px-1", i === arr.length - 1 && "text-foreground font-medium")}>
                {c.label}
              </span>
            )}
          </span>
        ))}
      </nav>
      {pageActions && <div className="flex shrink-0 items-center gap-2">{pageActions}</div>}
    </header>
  );
}
