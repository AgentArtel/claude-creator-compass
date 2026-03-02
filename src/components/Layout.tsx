import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Globe, 
  FolderSearch, 
  Workflow, 
  User, 
  Database, 
  Bot, 
  Plug,
  LogOut
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/platforms", label: "Platforms", icon: Globe },
  { to: "/local-agent", label: "Local Agent", icon: FolderSearch, disabled: true },
  { to: "/pipeline", label: "Pipeline", icon: Workflow, disabled: true },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/knowledge", label: "Knowledge", icon: Database },
  { to: "/agents", label: "Agents", icon: Bot },
  { to: "/mcp", label: "MCP", icon: Plug, disabled: true },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background grid-overlay scanline relative">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center h-14 px-6">
          {/* Logo */}
          <div className="flex items-center gap-2 mr-8">
            <div className="w-7 h-7 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-primary text-sm font-bold font-heading">I²</span>
            </div>
            <span className="font-heading text-sm font-semibold tracking-tight text-foreground">
              Identity Intelligence
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, disabled }) => (
              disabled ? (
                <span
                  key={to}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground/40 cursor-not-allowed select-none rounded-md"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </span>
              ) : (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
                  activeClassName="text-primary bg-primary/10 hover:text-primary"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </NavLink>
              )
            ))}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
              <span className="text-xs font-mono text-muted-foreground">{user?.email ?? "System Online"}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={signOut}>
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
