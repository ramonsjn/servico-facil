"use client";

import Link from "next/link";
import { Sun, Moon, Menu, X, Wrench, LogOut, LayoutDashboard, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => setMounted(true), []);

  const userInitial = session?.user?.name?.charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Wrench className="h-6 w-6 text-primary" />
          <span>ServiçoFácil</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Início
          </Link>
          <Link href="/?categoria=reforma" className="text-muted-foreground hover:text-foreground transition-colors">
            Reforma
          </Link>
          <Link href="/?categoria=eletrica" className="text-muted-foreground hover:text-foreground transition-colors">
            Elétrica
          </Link>
          <Link href="/?categoria=limpeza" className="text-muted-foreground hover:text-foreground transition-colors">
            Limpeza
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Alternar tema"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{userInitial}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{session.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href={session.user?.role === "PRESTADOR" ? "/dashboard/prestador" : "/dashboard/cliente"} className="flex items-center w-full">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Meu Painel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={`/perfil/${session.user?.id}`} className="flex items-center w-full">
                    <User className="h-4 w-4 mr-2" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className="hidden md:inline-flex">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link href="/cadastro" className="hidden md:inline-flex">
                <Button size="sm">Cadastrar</Button>
              </Link>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t p-4 space-y-3 bg-background">
          <Link href="/" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>Início</Link>
          <Link href="/?categoria=reforma" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>Reforma</Link>
          <Link href="/?categoria=eletrica" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>Elétrica</Link>
          <Link href="/?categoria=limpeza" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>Limpeza</Link>
          {session ? (
            <>
              <Separator />
              <Link href={session?.user?.role === "PRESTADOR" ? "/dashboard/prestador" : "/dashboard/cliente"} className="block text-sm" onClick={() => setMobileOpen(false)}>Meu Painel</Link>
              <button className="block text-sm text-muted-foreground" onClick={() => { signOut(); setMobileOpen(false); }}>Sair</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">Entrar</Button>
              </Link>
              <Link href="/cadastro" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full">Cadastrar</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
