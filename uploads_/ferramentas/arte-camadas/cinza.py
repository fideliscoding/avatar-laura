# gera a versao cinza (para tint por peca) de roupas, calcados e acessorios, preservando sombras e contorno
import numpy as np, glob, os, json
from PIL import Image
C='/workspace/laura-jogo/criador-poc/camadas/'
REF=235
for f in sorted(glob.glob(C+'*.png')):
    n=os.path.basename(f)[:-4]
    if not n.startswith(('roupa','vestido','casaco','meias','calcado','acessorio')) or n.endswith('-cinza'): continue
    a=np.asarray(Image.open(f)).astype(float)
    rgb=a[...,:3]; al=a[...,3]
    L=0.299*rgb[...,0]+0.587*rgb[...,1]+0.114*rgb[...,2]
    body=(al>230)&(L>70)            # tecido (sem contorno)
    ref=np.percentile(L[body],70)
    g=np.where(L<55, L, np.clip(L/ref*REF,0,255))   # contorno fica como esta
    out=np.dstack([g,g,g,al]).astype(np.uint8)
    Image.fromarray(out,'RGBA').save(C+n+'-cinza.png'); print(n,round(ref))
