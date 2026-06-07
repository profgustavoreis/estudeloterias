import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-4 justify-between shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <div className="text-sm text-muted-foreground hidden md:block">
          Dados atualizados diariamente após os sorteios da Caixa.
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Add user menu or theme toggle here if needed */}
      </div>
    </header>
  );
}
