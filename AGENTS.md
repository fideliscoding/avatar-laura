# Instruções para o Codex (e qualquer agente de código)

Leia este arquivo inteiro antes de qualquer tarefa. Ele vale para todo o repositório.

## Projeto

"My Town, My World" (Minha Cidade, Meu Mundo): jogo infantil para a Laura, 9 anos. Visual chibi profissional, paleta lilás. Ensina valores e virtudes do dia a dia (honestidade, empatia, gentileza, paciência, responsabilidade, cuidado, gratidão, coragem, perdão, respeito), não só religiosos. Público: criança. Idioma: **pt-BR** em tudo (interface, código comentado, commits, PRs, docs).

Referências obrigatórias:
- `prototype/my-town-my-world.html`: protótipo aprovado. Comportamento, textos e coordenadas devem bater com ele.
- `docs/GDD.md`: design do jogo. `docs/ARTE.md`: assets, âncoras e escalas. `docs/ROADMAP.md`: etapas.
- `docs/SUPABASE.md` e `supabase/migrations/`: banco. `docs/DEPLOY.md`: publicação.

## Stack (não trocar sem pedido explícito)

- Phaser **3** (3.90.0), Vite 7, TypeScript 5 em modo `strict`, Vitest 4.
- Mapas em Tiled (`.tmj` JSON) em `public/assets/mapas/`.
- Supabase (`@supabase/supabase-js` v2) para Auth, Postgres com RLS e Realtime.
- Deploy: GitHub Pages via `.github/workflows/deploy.yml`. `vite.config.ts` tem `base: '/avatar-laura/'`; não remova.
- **Proibido:** Lovable, Firebase, servidores pagos, backends próprios, Phaser 4, React/Vue dentro do jogo.
- Antes de adicionar ou atualizar uma dependência, confirme a versão real com `npm view <pacote> version`. Não invente versões. Fixe versões exatas no `package.json`.

## Estrutura e padrões de código

```
src/main.ts            configuração do Phaser (Scale.RESIZE; mundo lógico 1280x720)
src/config/assets.ts   lista central de assets e cores (toda imagem nova entra aqui)
src/scenes/            uma classe por cena (CenaBoot, CenaCriador, CenaParque, ...)
src/game/              lógica pura, sem Phaser (missões, estado, regras). Sempre com teste.
src/ui/                componentes visuais reutilizáveis (Botao, Dialogo, ...)
src/net/               (etapa 03+) cliente Supabase, sincronização e Realtime
tests/                 testes Vitest (*.test.ts)
```

- Nomes em português (cenas, variáveis de domínio, textos). Termos técnicos do Phaser ficam como são.
- Lógica de missões fica em `src/game/` como funções puras e testáveis; a cena só chama essas funções e anima.
- Textos que a criança lê ficam em constantes (ex.: `TEXTOS` em `missaoPedrinho.ts`), nunca espalhados.
- Mundo e interações mantêm coordenadas de 1280x720; a interface usa pixels do viewport, em cena separada, com layout mobile first. Personagens com origem (0.5, 1) nos pés e profundidade (`depth`) igual ao `y`.
- Sem `any`. Sem `console.log` esquecido. Sem dependências desnecessárias.
- O gancho `window.__jogo` existe para testes automatizados; mantenha.

## Regras de arte

- Estilo chibi profissional, cabeça grande, contorno suave, cores pastel, paleta lilás (`#b58cf5`, `#8b55e6`, `#5a2fa8`) com rosa (`#f27ab3`) como cor de destaque. Fonte Fredoka.
- PNG com fundo transparente, sem borda branca, recortado rente. Nomes em minúsculas, com hífen, sem acento: `laura-frente-liso.png`.
- Não copie personagens, logos, telas ou artes de jogos existentes (Avatar World, Toca Boca etc.). Inspiração sim, cópia não.
- Se faltar um asset, use um placeholder simples desenhado com `Graphics` (formas lilases) e registre a falta em `docs/ARTE.md` na seção "Assets que faltam". Nunca baixe imagens da internet.
- **Nenhum emoji** em código, textos do jogo, docs, commits ou PRs. Use ícones desenhados ou PNG. O script `npm run check:emojis` falha se encontrar algum.

## Segurança infantil (obrigatório)

- **Sem chat livre no MVP.** Toda comunicação entre jogadores é por **frases prontas** de uma lista fixa (ex.: "Oi!", "Vamos brincar?", "Obrigado!", "Muito bem!", "Tchau!"), mais acenos/emotes desenhados.
- Nenhum campo de texto livre visível para outros jogadores. Apelido: escolhido de uma lista ou validado (1 a 20 caracteres, filtro de palavras).
- Não coletar nome completo, escola, endereço, foto, localização ou telefone da criança.
- Conta criada pelo responsável. Multiplayer só com amigos aprovados pelo responsável (código de convite).
- Escolhas "erradas" nas missões nunca punem nem humilham: mostram um conselho gentil e deixam tentar de novo.
- Sem anúncios, sem compras, sem links externos dentro do jogo.

## Segurança de dados

- Só `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` podem ir para o front (são públicas por natureza; a proteção é a RLS).
- **Nunca** coloque a `service_role` key no repositório, no código, em workflows ou em logs.
- Toda tabela nova precisa de RLS ligado e políticas na mesma migração. Moedas só mudam por função `security definer` validada no servidor.
- Migrações novas: arquivo novo `supabase/migrations/000N_descricao.sql`. Nunca edite uma migração já aplicada.
- Sem Supabase configurado, o jogo deve continuar funcionando offline (localStorage).

## Antes de concluir qualquer tarefa

1. `npm install` (ou `npm ci`)
2. `npm run build` (inclui `tsc --noEmit`) sem erros
3. `npm test` passando, com testes novos para toda lógica nova
4. `npm run check:emojis` passando
5. Rodar `npm run dev`, abrir `http://localhost:5173/avatar-laura/` e conferir a tela mexida; se possível, anexar screenshot ao PR em `docs/screenshots/`
6. Atualizar a documentação afetada (`docs/*.md`, `README.md`)

Não entregue com build quebrado ou teste falhando. Se algo não puder ser feito, explique no PR o quê e por quê.

## Commits e PRs

- Commits pequenos e focados, em pt-BR, no imperativo: `Adiciona cena da padaria`, `Corrige profundidade da gangorra`.
- Um PR por etapa/prompt. Título claro. Descrição com: o que mudou, como testar, screenshots, critérios de aceite marcados, pendências.
- Não reformatar arquivos que não fazem parte da tarefa.
