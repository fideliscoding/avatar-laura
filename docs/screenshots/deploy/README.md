# Conferência da publicação

Capturas feitas em 01/11/2026 no Chromium, palco 1280x720, renderer Canvas.

- [Preview do build](preview-parque.png): `/avatar-laura/`, sem variáveis de ambiente.
- [Site publicado](publicado-parque.png): main com deploy aprovado, antes do merge desta etapa.
- [Servidor de desenvolvimento](dev-parque.png): conferência exigida pelo AGENTS.md.
- [JavaScript desativado](sem-javascript.png): aviso amigável visível no preview.

Nos três ambientes, as 19 imagens e a fonte Fredoka carregaram com prefixo
`/avatar-laura/`, sem 404 ou erros de console. O `.nojekyll` respondeu 200 no
preview e existe no `dist/`. As metatags e o aviso novos chegam ao site publicado
após o merge desta etapa.
