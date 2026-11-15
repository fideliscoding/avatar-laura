# Referência do criador de personagens

O conteúdo de `uploads_/criador-poc/` foi preservado nesta pasta como referência; não está integrado ao jogo. As imagens e os nomes de arquivos e subpastas foram mantidos. O HTML recebeu apenas o ajuste do caminho relativo das camadas para `../../public/assets/personagens/camadas/frente/`.

## Destinos do pacote

| Origem em `uploads_/` | Destino no repositório |
|---|---|
| `docs/PADRAO-VISUAL.md` | `docs/PADRAO-VISUAL.md` |
| `docs/ARTE-CAMADAS.md` | `docs/ARTE-CAMADAS.md` |
| `docs/ARTE-NECESSARIA.md` | `docs/ARTE-NECESSARIA.md` (preserva pedidos anteriores e acrescenta os novos) |
| `docs/referencias/` | `docs/referencias/` (10 imagens adicionadas; referências anteriores preservadas) |
| `public/assets/personagens/camadas/frente/` | mesmo caminho (21 PNGs e `ancoras.json`) |
| `criador-poc/` | `docs/criador-poc/` (HTML e 19 screenshots) |
| `ferramentas/arte-camadas/` | `tools/arte-camadas/` (scripts e imagens-fonte, incluindo `gen/gen/`) |
| `LEIA-ME.md` | `docs/criador-poc/LEIA-ME.md` (instruções originais arquivadas) |

O `AGENTS.md` novo já estava na raiz na versão recebida; não havia outro em `uploads_/`. Foram mantidas a REGRA DE OURO e as regras de camadas e restauradas as instruções anteriores de `Scale.RESIZE`, mundo lógico 1280x720 e interface mobile first separada. A orientação antiga de placeholders foi substituída pela reutilização de assets aprovados e registro de pedidos.

## Conferir a referência

Na raiz do repositório, execute `python3 -m http.server 8000 --bind 127.0.0.1` e abra o caminho `/docs/criador-poc/index.html` no navegador. Use HTTP para permitir leitura de pixels; `file://` não funciona. O `LEIA-ME.md` arquivado descreve a disposição original do pacote; os destinos e o caminho de execução atualizados são os desta página.

## Pendência do pacote recebido

O LEIA-ME original anuncia 81 PNGs e um JSON, mas o upload contém somente **21 PNGs e `ancoras.json`**. Das 77 imagens identificadas pelas categorias e camadas de corpo do manifesto, **56 estão ausentes**, inclusive corpo, cabelos, olhos e roupas. Por isso o protótipo não renderiza o personagem completo. As screenshots recebidas servem como referência visual, não como prova de funcionamento deste conjunto parcial. Nenhuma imagem foi gerada ou alterada para suprir essa ausência.

As ferramentas em `tools/arte-camadas/` são uma referência de produção: mantêm os caminhos absolutos originais e precisam de adaptação antes de execução. Nenhum gerador foi executado durante a organização.

### Camadas referenciadas ausentes

- `boca-padrao.png`
- `boca-pisca.png`
- `boca-sono.png`
- `boca-surpresa.png`
- `boca-triste.png`
- `cabelo-frente-cacheado.png`
- `cabelo-frente-coquinhos.png`
- `cabelo-frente-franjareta.png`
- `cabelo-frente-liso.png`
- `cabelo-frente-ondulado.png`
- `cabelo-frente-rabo.png`
- `cabelo-frente-trancas.png`
- `cabelo-tras-cacheado.png`
- `cabelo-tras-coquinhos.png`
- `cabelo-tras-franjareta.png`
- `cabelo-tras-liso.png`
- `cabelo-tras-ondulado.png`
- `cabelo-tras-rabo.png`
- `cabelo-tras-trancas.png`
- `calcado-sapatilha-rosa-cinza.png`
- `calcado-sapatilha-rosa.png`
- `calcado-tenis-branco-cinza.png`
- `calcado-tenis-branco.png`
- `casaco-lilas-cinza.png`
- `casaco-lilas.png`
- `corpo-linhas.png`
- `corpo-pele.png`
- `meias-listradas-cinza.png`
- `meias-listradas.png`
- `olhos-alegre.png`
- `olhos-confiante.png`
- `olhos-coracao.png`
- `olhos-estrela.png`
- `olhos-padrao.png`
- `olhos-pisca.png`
- `olhos-sono.png`
- `olhos-surpresa.png`
- `olhos-triste.png`
- `roupa-baixo-calca-jeans-cinza.png`
- `roupa-baixo-calca-jeans.png`
- `roupa-baixo-saia-roxa-cinza.png`
- `roupa-baixo-saia-roxa.png`
- `roupa-baixo-short-jeans-cinza.png`
- `roupa-baixo-short-jeans.png`
- `roupa-cima-lilas-estrela-cinza.png`
- `roupa-cima-lilas-estrela.png`
- `roupa-cima-listras-rosa-cinza.png`
- `roupa-cima-listras-rosa.png`
- `sobrancelha-alegre.png`
- `sobrancelha-confiante.png`
- `sobrancelha-padrao.png`
- `sobrancelha-sono.png`
- `sobrancelha-surpresa.png`
- `sobrancelha-triste.png`
- `vestido-rosa-cinza.png`
- `vestido-rosa.png`
