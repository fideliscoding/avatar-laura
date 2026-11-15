import numpy as np,sys
from PIL import Image
C='/workspace/laura-jogo/criador-poc/camadas/'
def L(n): return np.asarray(Image.open(C+n+'.png')).astype(float)/255
def tint(n,h):
    a=L(n).copy(); c=np.array([int(h[i:i+2],16) for i in (1,3,5)])/255; a[...,:3]*=c; return a
def over(d,s):
    sa=s[...,3:]; o=d.copy(); o[...,:3]=s[...,:3]*sa+d[...,:3]*(1-sa); o[...,3:]=sa+d[...,3:]*(1-sa); return o
def comp(layers):
    o=np.zeros((768,512,4))
    for l in layers: o=over(o, tint(*l) if isinstance(l,tuple) else L(l))
    b=np.ones((768,512,3))*np.array([236,226,252])/255
    return Image.fromarray(((o[...,:3]*o[...,3:]+b*(1-o[...,3:]))*255).astype(np.uint8))
def face(f,ft=None,hf='liso',ht='liso',ext=()):
    return comp([('cabelo-tras-'+ht,'#5A3522'),('corpo-pele','#F39D6A'),'corpo-linhas','olhos-'+f,'boca-'+f,'sobrancelha-'+f,('cabelo-frente-'+hf,'#5A3522')]+list(ext))
def sheet(ims,cols,crop=None,fn='/tmp/s.png'):
    if crop: ims=[i.crop(crop) for i in ims]
    w,h=ims[0].size; S=Image.new('RGB',(w*cols,h*((len(ims)+cols-1)//cols)),'white')
    for k,i in enumerate(ims): S.paste(i,((k%cols)*w,(k//cols)*h))
    S.save(fn)
if __name__=='__main__':
    F=['padrao','estrela','coracao','triste','alegre','pisca','surpresa','sono','confiante']
    sheet([face(f,hf='franjareta',ht='franjareta') if 0 else comp([('corpo-pele','#F39D6A'),'corpo-linhas','olhos-'+f,'boca-'+f,'sobrancelha-'+f]) for f in F],5,(96,40,416,330),'/tmp/faces4.png')
    Hs=['liso','coquinhos','cacheado','franjareta','rabo','trancas','ondulado']
    sheet([face('padrao',hf=h,ht=h) for h in Hs],4,None,'/tmp/hairs.png')
