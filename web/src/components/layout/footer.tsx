import Link from "next/link";
import { Wrench } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 font-semibold mb-3">
              <Wrench className="h-5 w-5 text-primary" />
              <span>ServiçoFácil</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Conectando clientes aos melhores prestadores de serviço.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-sm mb-3">Para Clientes</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Como funciona</Link></li>
              <li><Link href="/" className="hover:text-foreground transition-colors">Buscar serviços</Link></li>
              <li><Link href="/" className="hover:text-foreground transition-colors">Categorias</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-sm mb-3">Para Prestadores</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/cadastro" className="hover:text-foreground transition-colors">Cadastre-se</Link></li>
              <li><Link href="/dashboard/prestador" className="hover:text-foreground transition-colors">Painel do prestador</Link></li>
              <li><Link href="/" className="hover:text-foreground transition-colors">Dicas e recursos</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ServiçoFácil. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
