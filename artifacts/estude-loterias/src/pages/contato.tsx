import { useState } from "react";
import { PageSEO } from "@/components/seo/PageSEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, CheckCircle2 } from "lucide-react";

const COR = "#009640";

const ASSUNTOS = [
  "Erro nos dados / resultado incorreto",
  "Sugestão de melhoria",
  "Problema técnico no site",
  "Solicitação de remoção de dados (LGPD)",
  "Parceria ou publicidade",
  "Outro assunto",
];

export default function Contato() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (!nome.trim() || !email.trim() || !assunto || !mensagem.trim()) {
      setErro("Por favor, preencha todos os campos.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErro("Por favor, informe um e-mail válido.");
      return;
    }

    const subject = encodeURIComponent(`[Estude Loterias] ${assunto}`);
    const body = encodeURIComponent(
      `Nome: ${nome}\nE-mail: ${email}\nAssunto: ${assunto}\n\n${mensagem}`
    );
    window.location.href = `mailto:contato@estudeloterias.com.br?subject=${subject}&body=${body}`;
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="max-w-xl mx-auto py-16 flex flex-col items-center text-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: COR }}
        >
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Mensagem preparada!</h2>
        <p className="text-muted-foreground text-sm">
          Seu cliente de e-mail foi aberto com a mensagem preenchida. Se preferir, escreva
          diretamente para{" "}
          <a
            href="mailto:contato@estudeloterias.com.br"
            className="text-[#009640] hover:underline font-medium"
          >
            contato@estudeloterias.com.br
          </a>
          .
        </p>
        <Button variant="outline" onClick={() => setEnviado(false)}>
          Enviar outra mensagem
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <PageSEO
        title="Contato — Estude Loterias"
        description="Entre em contato com o Estude Loterias. Reporte erros, envie sugestões ou faça solicitações relacionadas à privacidade (LGPD)."
        canonical="/contato"
      />

      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white shrink-0"
          style={{ backgroundColor: COR }}
        >
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>
            Contato
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Encontrou um erro? Tem uma sugestão? Fale com a gente.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="sm:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Enviar mensagem</CardTitle>
              <CardDescription>
                Preencha o formulário abaixo. Responderemos pelo e-mail informado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nome">Nome</Label>
                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009640]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009640]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="assunto">Assunto</Label>
                  <select
                    id="assunto"
                    value={assunto}
                    onChange={(e) => setAssunto(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009640]"
                  >
                    <option value="">Selecione o assunto</option>
                    {ASSUNTOS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mensagem">Mensagem</Label>
                  <textarea
                    id="mensagem"
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    rows={5}
                    placeholder="Descreva sua dúvida ou sugestão..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009640] resize-none"
                  />
                </div>

                {erro && (
                  <p className="text-sm text-destructive">{erro}</p>
                )}

                <Button
                  type="submit"
                  className="w-full text-white font-semibold"
                  style={{ backgroundColor: COR }}
                >
                  Enviar Mensagem
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">E-mail</div>
                  <a
                    href="mailto:contato@estudeloterias.com.br"
                    className="text-sm text-[#009640] hover:underline break-all"
                  >
                    contato@estudeloterias.com.br
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Para solicitações relacionadas à privacidade e proteção de dados (LGPD),
                selecione o assunto <em>"Solicitação de remoção de dados (LGPD)"</em> no
                formulário. Responderemos em até 15 dias úteis.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
