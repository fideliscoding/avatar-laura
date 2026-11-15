import sys,json,glob,os; sys.path.insert(0,'.')
import numpy as np, prev2, tint2
from PIL import Image, ImageDraw, ImageFont
C=prev2.C; S='/workspace/laura-jogo/criador-poc/shots-v2/'
M=json.load(open(C+'ancoras.json')); PAL=M['paletas']; REF=M['tint']['ref']
def ref(n): return REF['pele'] if n=='corpo-pele' else REF['cabelo'] if n.startswith('cabelo') else REF['peca']
prev2.tint=lambda n,c: tint2.tint(prev2.L(n),c,ref(n))
comp=prev2.comp
F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',15)
def tile(im,lab,w=180,h=220):
    a=np.asarray(im); bg=np.array([236,226,252]); diff=np.abs(a.astype(int)-bg).sum(-1)>12
    ys,xs=np.where(diff)
    if len(ys): im=im.crop((max(xs.min()-8,0),max(ys.min()-8,0),xs.max()+8,ys.max()+8))
    im.thumbnail((w-12,h-36)); T=Image.new('RGB',(w,h),(236,226,252)); T.paste(im,((w-im.width)//2,6+(h-36-im.height)//2))
    d=ImageDraw.Draw(T); d.rectangle((0,h-28,w,h),fill='white'); d.text((6,h-24),lab[:22],fill=(75,45,132),font=F); return T
def grid(ts,cols,fn,title=None):
    w,h=ts[0].size; rows=(len(ts)+cols-1)//cols; top=44 if title else 0
    G=Image.new('RGB',(cols*w+(cols+1)*6,rows*h+(rows+1)*6+top),(205,184,243))
    if title: ImageDraw.Draw(G).text((12,10),title,fill='white',font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',24))
    for k,t in enumerate(ts): G.paste(t,(6+(k%cols)*(w+6),top+6+(k//cols)*(h+6)))
    G.save(fn); print(fn,G.size)
hc='#5A3522'; pc='#F39D6A'
FACE=[('corpo-pele',pc),'corpo-linhas']
names=sorted(os.path.basename(f)[:-4] for f in glob.glob(C+'*.png'))
ts=[]
for n in names:
    if n.startswith(('olhos','boca','sobrancelha')): continue
    if n=='corpo-pele': ts.append(tile(comp([(n,pc)]),'corpo-pele (#F39D6A)'))
    elif n.startswith('cabelo'): ts.append(tile(comp([(n,hc)]),n.replace('cabelo-','cab-')))
    elif n.endswith('-cinza'): ts.append(tile(comp([n]),n.replace('acessorio-','ac-')))
    else: ts.append(tile(comp([n]),n.replace('acessorio-','ac-')))
grid(ts,8,S+'folha-todas-as-pecas.png','Todas as pecas (pose frente) - cabelo #5A3522, pele #F39D6A; "-cinza" = versao para cor por peca')
# cores por peca
ts=[]
for n in ['roupa-cima-lilas-estrela','casaco-lilas','roupa-baixo-saia-roxa','acessorio-bolsa-rosa']:
    for c in [None]+PAL['peca'][1:12:2]:
        ts.append(tile(comp([n] if c is None else [(n+'-cinza',c)]),'original' if c is None else c))
grid(ts,7,S+'folha-cor-por-peca.png','Cor por peca: original + amostras da paleta de 12 cores')
# rostos
ts=[]
base=FACE
for k in ['olhos','boca','sobrancelha']:
    for i in M['categorias'][k]['itens']:
        R={'olhos':'padrao','boca':'padrao','sobrancelha':'padrao'}; R[k]=i
        im=comp(base+['olhos-'+R['olhos'],'boca-'+R['boca'],'sobrancelha-'+R['sobrancelha']]).crop((132,165,380,355))
        ts.append(tile(im,k+': '+i,180,180))
for r in ['feliz','triste']:
    R=M['rostos'][r]; ts.append(tile(comp(base+['olhos-'+R['olhos'],'boca-'+R['boca'],'sobrancelha-'+R['sobrancelha']]).crop((132,165,380,355)),'ROSTO '+r,180,180))
grid(ts,9,S+'folha-rostos.png','Rosto montavel: 9 olhos, 8 bocas, 6 sobrancelhas + rostos de reacao')
# pele e cabelo
ts=[tile(comp([('corpo-pele',c),'corpo-linhas','olhos-padrao','boca-padrao','sobrancelha-padrao']).crop((90,60,422,420)),c+(' Laura' if c=='#F39D6A' else ''),150,170) for c in PAL['pele']]
ts+=[tile(comp([('cabelo-tras-ondulado',c),('corpo-pele',pc),'corpo-linhas','olhos-padrao','boca-padrao','sobrancelha-padrao',('cabelo-frente-ondulado',c)]).crop((40,40,472,520)),c,150,170) for c in PAL['cabelo']]
grid(ts,12,S+'folha-paletas-pele-cabelo.png','12 tons de pele (inclui Laura #F39D6A) e 12 cores de cabelo (tint HSL, sem acinzentar)')
# cabelo frente x tras
ts=[]
H=M['categorias']['cabeloFrente']['itens']
for f in H:
    for t in H:
        ts.append(tile(comp([('cabelo-tras-'+t,hc),('corpo-pele',pc),'corpo-linhas','olhos-padrao','boca-padrao','sobrancelha-padrao',('cabelo-frente-'+f,hc)]).crop((20,20,492,560)),f[:8]+' + '+t[:8],130,150))
grid(ts,7,S+'folha-cabelo-frente-x-tras.png','Cabelo em 2 partes: linhas = franja (frente), colunas = tras')
# ---- 8 combinacoes (mesma ordem de camadas do index.html) ----
def look(Q):
    hc=PAL['cabelo'][Q['cab']]; pc=PAL['pele'][Q['pele']]; L=[]
    def pc_(n,c): return (n+'-cinza',c) if c else n
    if Q.get('tras'): L.append(('cabelo-tras-'+Q['tras'],hc))
    L+=[('corpo-pele',pc),'corpo-linhas','olhos-'+Q.get('olhos','padrao'),'boca-'+Q.get('boca','padrao'),'sobrancelha-'+Q.get('sobr','padrao')]
    P=Q.get('pecas',{}); A=Q.get('ac',{})
    for k in ['meias','baixo','cima','vestido','calcado']:
        if k in P: L.append(pc_(P[k][0],P[k][1]))
    if 'colar-coracao' in A: L.append(pc_('acessorio-colar-coracao',A['colar-coracao']))
    if 'casaco' in P: L.append(pc_(P['casaco'][0],P['casaco'][1]))
    for a in ['bolsa-rosa','brincos-bolinha','brincos-estrela']:
        if a in A: L.append(pc_('acessorio-'+a,A[a]))
    if Q.get('frente'): L.append(('cabelo-frente-'+Q['frente'],hc))
    for a in ['tiara','presilha-laura','laco-rosa','bone-lilas','oculos-vermelho']:
        if a in A: L.append(pc_('acessorio-'+a,A[a]))
    return comp(L)
LOOKS=[
 ('1 Laura padrao',dict(pele=3,cab=1,frente='liso',tras='liso',pecas={'cima':('roupa-cima-lilas-estrela',None),'baixo':('roupa-baixo-saia-roxa',None),'calcado':('calcado-tenis-branco',None)},ac={'oculos-vermelho':None,'presilha-laura':None,'brincos-bolinha':None})),
 ('2 franja reta + ondulado',dict(pele=1,cab=5,frente='franjareta',tras='ondulado',olhos='estrela',boca='alegre',pecas={'vestido':('vestido-rosa','#C9A8F5'),'calcado':('calcado-sapatilha-rosa','#FFFFFF')},ac={'tiara':None,'colar-coracao':None})),
 ('3 casaco+short+meias',dict(pele=8,cab=0,frente='cacheado',tras='cacheado',olhos='confiante',boca='confiante',sobr='confiante',pecas={'cima':('roupa-cima-listras-rosa',None),'casaco':('casaco-lilas','#7ED6B5'),'baixo':('roupa-baixo-short-jeans',None),'meias':('meias-listradas','#6FB7FF'),'calcado':('calcado-tenis-branco',None)},ac={'bolsa-rosa':'#FFE070'})),
 ('4 rabo + coracao',dict(pele=10,cab=9,frente='rabo',tras='rabo',olhos='coracao',boca='coracao',pecas={'cima':('roupa-cima-lilas-estrela','#FF9EC8'),'baixo':('roupa-baixo-calca-jeans',None),'calcado':('calcado-sapatilha-rosa',None)},ac={'brincos-estrela':None,'laco-rosa':'#9B6FE0'})),
 ('5 trancas + bone',dict(pele=5,cab=3,frente='trancas',tras='trancas',olhos='pisca',boca='pisca',pecas={'cima':('roupa-cima-lilas-estrela','#6FB7FF'),'baixo':('roupa-baixo-short-jeans','#2E3A6E'),'meias':('meias-listradas',None),'calcado':('calcado-tenis-branco','#F0507A')},ac={'bone-lilas':'#F0507A','bolsa-rosa':None})),
 ('6 coquinhos + surpresa',dict(pele=0,cab=8,frente='coquinhos',tras='coquinhos',olhos='surpresa',boca='surpresa',sobr='surpresa',pecas={'vestido':('vestido-rosa',None),'casaco':('casaco-lilas','#FFFFFF'),'calcado':('calcado-sapatilha-rosa','#C9A8F5')},ac={'tiara':'#FFE070','brincos-bolinha':None})),
 ('7 franja + trancas',dict(pele=6,cab=6,frente='franjareta',tras='trancas',olhos='sono',boca='sono',sobr='sono',pecas={'cima':('roupa-cima-listras-rosa','#7ED6B5'),'baixo':('roupa-baixo-saia-roxa','#FFB35C'),'calcado':('calcado-tenis-branco',None)},ac={'oculos-vermelho':'#6B3FC0','colar-coracao':None})),
 ('8 sem roupa = triste',dict(pele=3,cab=1,frente='liso',tras='liso',olhos='triste',boca='triste',sobr='triste',pecas={},ac={})),
]
ts=[tile(look(q),lab,250,370) for lab,q in LOOKS]
grid(ts,4,S+'combinacoes-8.png','8 combinacoes montadas com as camadas v2')
for i,(lab,q) in enumerate(LOOKS): look(q).save(S+'combo-%d.png'%(i+1))
