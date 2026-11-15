# Referência do criador de personagens

O conteúdo de `uploads_/criador-poc/` foi preservado nesta pasta como referência; não está integrado ao jogo. As imagens e os nomes de arquivos e subpastas foram mantidos. O HTML recebeu apenas o ajuste do caminho relativo das camadas para `../../public/assets/personagens/camadas/frente/`.

## Destinos do pacote

| Origem em `uploads_/` | Destino no repositório |
|---|---|
| `docs/PADRAO-VISUAL.md` | `docs/PADRAO-VISUAL.md` |
| `docs/ARTE-CAMADAS.md` | `docs/ARTE-CAMADAS.md` |
| `docs/ARTE-NECESSARIA.md` | `docs/ARTE-NECESSARIA.md` (preserva pedidos anteriores e acrescenta os novos) |
| `docs/referencias/` | `docs/referencias/` (10 imagens adicionadas; referências anteriores preservadas) |
| `public/assets/personagens/camadas/frente/` | mesmo caminho (81 PNGs e `ancoras.json`; conjunto completo conferido) |
| `criador-poc/` | `docs/criador-poc/` (HTML e 19 screenshots) |
| `ferramentas/arte-camadas/` | `tools/arte-camadas/` (scripts e imagens-fonte, incluindo `gen/gen/`) |
| `LEIA-ME.md` | `docs/criador-poc/LEIA-ME.md` (instruções originais arquivadas) |

O `AGENTS.md` novo já estava na raiz na versão recebida; não havia outro em `uploads_/`. Foram mantidas a REGRA DE OURO e as regras de camadas e restauradas as instruções anteriores de `Scale.RESIZE`, mundo lógico 1280x720 e interface mobile first separada. A orientação antiga de placeholders foi substituída pela reutilização de assets aprovados e registro de pedidos.

## Conferir a referência

Na raiz do repositório, execute `python3 -m http.server 8000 --bind 127.0.0.1` e abra o caminho `/docs/criador-poc/index.html` no navegador. Use HTTP para permitir leitura de pixels; `file://` não funciona. O `LEIA-ME.md` arquivado descreve a disposição original do pacote; os destinos e o caminho de execução atualizados são os desta página.

## Conferência do conjunto completo

A pendência do upload inicial foi resolvida: `public/assets/personagens/camadas/frente/` contém **81 PNGs e `ancoras.json`**. Todas as **56 imagens antes listadas como ausentes** estão presentes (conferência individual abaixo). Os 81 PNGs foram abertos para leitura e confirmados como RGBA de 512 x 768; seus hashes SHA-256 permaneceram idênticos durante a validação. Nenhuma imagem existente foi alterada.

### Resultado no navegador

O protótipo foi servido por HTTP a partir da raiz do repositório e validado no Chromium:

- As 77 imagens usadas pelo pré-carregamento do HTML carregaram e forneceram pixels ao compositor, sem camadas inválidas.
- A composição padrão desenhou as 13 camadas esperadas, incluindo corpo, rosto, cabelo, roupa, calçado e acessórios; nenhuma dessas camadas está vazia. O personagem completo foi conferido visualmente contra `docs/referencias/ui-1-franja.png`.
- Todas as 81 imagens responderam HTTP 200. As quatro imagens adicionais não usadas pelo manifesto atual são `boca-estrela.png`, `sobrancelha-coracao.png`, `sobrancelha-estrela.png` e `sobrancelha-pisca.png`.
- Foram exercitadas 18 combinações: 3 tons de pele, 3 cores de cabelo e 2 cabelos, com tint de roupa. Sorteio e persistência após recarregar também funcionaram.
- Não houve erros de JavaScript nem avisos de camada faltando. O navegador emitiu apenas avisos não bloqueantes: favicon ausente e sugestão de `willReadFrequently` para desempenho do canvas.

[Captura da validação do personagem completo](../screenshots/criador-poc-completo.png). A captura é nova; as imagens do pacote permanecem intactas. O protótipo continua como referência, sem integração ao jogo.

### Limitações que permanecem

As ferramentas em `tools/arte-camadas/` são uma referência de produção: mantêm os caminhos absolutos originais e precisam de adaptação antes de execução. Nenhum gerador foi executado nesta conferência. O `LEIA-ME.md` arquivado continua preservado como documento histórico.

### Camadas anteriormente ausentes: todas presentes

- [x] `boca-padrao.png`
- [x] `boca-pisca.png`
- [x] `boca-sono.png`
- [x] `boca-surpresa.png`
- [x] `boca-triste.png`
- [x] `cabelo-frente-cacheado.png`
- [x] `cabelo-frente-coquinhos.png`
- [x] `cabelo-frente-franjareta.png`
- [x] `cabelo-frente-liso.png`
- [x] `cabelo-frente-ondulado.png`
- [x] `cabelo-frente-rabo.png`
- [x] `cabelo-frente-trancas.png`
- [x] `cabelo-tras-cacheado.png`
- [x] `cabelo-tras-coquinhos.png`
- [x] `cabelo-tras-franjareta.png`
- [x] `cabelo-tras-liso.png`
- [x] `cabelo-tras-ondulado.png`
- [x] `cabelo-tras-rabo.png`
- [x] `cabelo-tras-trancas.png`
- [x] `calcado-sapatilha-rosa-cinza.png`
- [x] `calcado-sapatilha-rosa.png`
- [x] `calcado-tenis-branco-cinza.png`
- [x] `calcado-tenis-branco.png`
- [x] `casaco-lilas-cinza.png`
- [x] `casaco-lilas.png`
- [x] `corpo-linhas.png`
- [x] `corpo-pele.png`
- [x] `meias-listradas-cinza.png`
- [x] `meias-listradas.png`
- [x] `olhos-alegre.png`
- [x] `olhos-confiante.png`
- [x] `olhos-coracao.png`
- [x] `olhos-estrela.png`
- [x] `olhos-padrao.png`
- [x] `olhos-pisca.png`
- [x] `olhos-sono.png`
- [x] `olhos-surpresa.png`
- [x] `olhos-triste.png`
- [x] `roupa-baixo-calca-jeans-cinza.png`
- [x] `roupa-baixo-calca-jeans.png`
- [x] `roupa-baixo-saia-roxa-cinza.png`
- [x] `roupa-baixo-saia-roxa.png`
- [x] `roupa-baixo-short-jeans-cinza.png`
- [x] `roupa-baixo-short-jeans.png`
- [x] `roupa-cima-lilas-estrela-cinza.png`
- [x] `roupa-cima-lilas-estrela.png`
- [x] `roupa-cima-listras-rosa-cinza.png`
- [x] `roupa-cima-listras-rosa.png`
- [x] `sobrancelha-alegre.png`
- [x] `sobrancelha-confiante.png`
- [x] `sobrancelha-padrao.png`
- [x] `sobrancelha-sono.png`
- [x] `sobrancelha-surpresa.png`
- [x] `sobrancelha-triste.png`
- [x] `vestido-rosa-cinza.png`
- [x] `vestido-rosa.png`
