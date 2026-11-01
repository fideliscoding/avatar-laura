# Contas do responsável e sincronização

Capturas em Chromium, renderer Canvas, palco 1280x720.

- [Entrada](1-entrar.png): e-mail e senha do adulto, cadastro e modo convidado.
- [Missão sincronizada](2-missao-sincronizada.png): conta temporária no Supabase real,
  apelido no HUD e saldo oficial de 15 moedas.
- [Sem rede](3-pendencia-offline.png): aviso discreto; a troca de cabelo enfileirada
  foi sincronizada após restaurar a rede.

O teste de navegador contra o projeto real confirmou login, cabelos, missão,
outro navegador, bloqueio do update de 999 moedas com erro 42501 e fila por conta.
Oito primeiras conclusões concorrentes também retornaram saldo 15. A conta
temporária confirmada foi removida depois da validação.

O CI executa 3 testes de navegador offline e 2 testes de tela de conta com API
simulada, incluindo cadastro, mensagem para confirmar e-mail, falha de login,
apelido inválido e campos DOM nas duas orientações do celular.
A entrega do e-mail real e sua confirmação pelo responsável precisam da
conferência manual descrita em `docs/SUPABASE.md`.
