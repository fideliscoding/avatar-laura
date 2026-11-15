# Pacote criador-camadas-v2 (02/11/2026)

Este pacote espelha as pastas do repositório `fideliscoding/avatar-laura`. Copie cada item para o mesmo caminho no repo.

| No pacote | No repo | Ação |
|---|---|---|
| `AGENTS.md` | `AGENTS.md` (raiz) | substituir (é o arquivo atual com a REGRA DE OURO no topo; a regra antiga de placeholder com `Graphics` foi trocada) |
| `docs/PADRAO-VISUAL.md` | `docs/PADRAO-VISUAL.md` | novo |
| `docs/ARTE-CAMADAS.md` | `docs/ARTE-CAMADAS.md` | substituir (v2 da pose frente) |
| `docs/ARTE-NECESSARIA.md` | `docs/ARTE-NECESSARIA.md` | substituir (o mesmo conteúdo mais a regra e a seção "Pedidos registrados") |
| `docs/referencias/*` | `docs/referencias/` | adicionar |
| `public/assets/personagens/camadas/frente/*` | mesmo caminho | novo (82 arquivos: 81 PNGs e `ancoras.json`) |
| `criador-poc/` | não vai para o repo | protótipo HTML e screenshots para conferir |
| `ferramentas/arte-camadas/` | `tools/arte-camadas/` (opcional) | scripts Python e imagens-fonte para gerar mais peças |

Para testar o protótipo, rode `python3 -m http.server` na raiz do pacote e abra `http://localhost:8000/criador-poc/index.html`. Em `file://` não funciona, porque o navegador bloqueia a leitura de pixels.
