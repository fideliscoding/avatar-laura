# v2: corpo sem rosto/brincos, rosto montavel, cabelo frente/tras, pecas novas, versoes cinza
from lib import *
import extrair, sys, os, json
from extrair import B, aB, P, BODY, HEAD
from PIL import Image
OUT='/workspace/laura-jogo/criador-poc/camadas/'; os.makedirs(OUT,exist_ok=True)
H,W=B.shape[:2]
ys,xs=np.where(aB>0.5); foot=ys.max(); top=ys.min()
fx=np.where(aB[foot-60:foot].max(0)>0.5)[0]; cx=(fx.min()+fx.max())/2
s=(736-96)/(foot-top)
MC=np.float32([[s,0,256-s*cx],[0,s,736-s*foot]])
def to_canvas(rgb,a):
    pm=np.dstack([rgb*a[...,None],a])
    o=cv2.warpAffine(pm,MC,(512,768),flags=cv2.INTER_AREA if s<1 else cv2.INTER_LINEAR)
    al=np.clip(o[...,3],0,1); c=np.where(al[...,None]>1e-3,o[...,:3]/np.maximum(al,1e-3)[...,None],0)
    return np.clip(c,0,255),al
INFO={}
def save(n,rgb,a,tipo='cor'):
    c,al=to_canvas(rgb,a); al[al<0.02]=0
    im=np.dstack([c[...,::-1],al*255]).astype(np.uint8)
    Image.fromarray(im,'RGBA').save(OUT+n+'.png'); INFO[n]=tipo; return im
lum=lambda x:0.299*x[...,2]+0.587*x[...,1]+0.114*x[...,0]
def box(y0,y1,x0,x1):
    m=np.zeros((H,W),bool); m[y0:y1,x0:x1]=True; return m
# ---------- corpo (pes descalcos + orelhas sem brinco) ----------
D=load('e-descalca.jpg'); Dw,_,_=register(D,B,BODY)
wgt=np.clip((np.arange(H)-1040)/50.,0,1)[:,None,None]
body=B*(1-wgt)+Dw*wgt
PR=load('e-presilha.jpg'); PRw,_,cc=register(PR,B,HEAD); print('presilha/orelha ecc',cc)
EARS=box(415,490,245,345)|box(395,470,680,750)
ef=cv2.GaussianBlur(EARS.astype(np.float32),(0,0),4)[...,None]
body=body*(1-ef)+PRw*ef
aBody=chroma_alpha(body); body=despill(body)
p,L=skin_p(body)
sk=(p>0.9)&(aBody>0.9)
Sest=cv2.inpaint(np.clip(body,0,255).astype(np.uint8),(~sk).astype(np.uint8)*255,6,cv2.INPAINT_TELEA).astype(np.float32)
Sest=cv2.GaussianBlur(Sest,(0,0),1.0)
Lm=np.median(lum(body)[sk])
g=np.clip(lum(Sest)/Lm*242,0,255)
sm=nd.binary_erosion(aBody>0.5,iterations=2).astype(np.float32); gb=cv2.GaussianBlur(g*sm,(0,0),9)/np.maximum(cv2.GaussianBlur(sm,(0,0),9),1e-3); g=np.where(sm>0,gb,g); g=np.clip(g,215,244)
sil=aBody>0.5; band=sil&~nd.binary_erosion(sil,iterations=3)
O=np.array([22.,24.,38.])
def line_unmix(C,S,p):
    d=S-O; t=np.clip(((C-O)*d).sum(-1)/np.maximum((d*d).sum(-1),1),0,1)
    res=np.linalg.norm(C-(O+t[...,None]*d),axis=-1)
    use=(res<22)&(t<0.97)&(t>0.0)
    return np.where(use,t,p), use
def detail(img,alpha):
    p,_=skin_p(img); p=np.where(band,0,p)
    p,use=line_unmix(img,Sest,p); p=np.where(band,0,p)
    pp=p[...,None]
    det=np.clip((img-pp*Sest)/np.maximum(1-pp,0.05),0,255)
    det=np.where(use[...,None]&~band[...,None],O,det)
    return det,alpha*(1-p)
det,adet=detail(body,aBody)
askin=cv2.GaussianBlur(nd.binary_erosion(sil,iterations=2).astype(np.float32),(0,0),0.7)
# zonas do rosto
EYE_X=box(0,H,326,492)|box(0,H,548,714)
MOUTH=box(436,545,440,610)
def split_row(a):
    rows=(a*EYE_X)[270:322].sum(1); return 270+int(np.argmin(rows))
def feats(det,adet,name):
    sp=split_row(adet)
    inside=nd.binary_erosion(aB>0.5,iterations=6)
    E=EYE_X&box(sp,450,0,W)&inside&~box(350,H,698,W)&~box(350,H,0,336); Bw=EYE_X&box(185,sp,0,W)&inside
    gm=(det[...,1]>det[...,2]+18)&(det[...,1]>det[...,0]+18)&MOUTH
    adet=adet*(1-cv2.GaussianBlur(nd.binary_dilation(gm,iterations=2).astype(np.float32),(0,0),1))
    fe=lambda m:cv2.GaussianBlur(m.astype(np.float32),(0,0),1.0)
    save('olhos-'+name,det,adet*fe(E)); save('sobrancelha-'+name,det,adet*fe(Bw)); save('boca-'+name,det,adet*fe(MOUTH))
    return sp
FACE_ALL=((EYE_X&box(185,450,0,W))|MOUTH)&nd.binary_erosion(aB>0.5,iterations=6)
fall=cv2.GaussianBlur(FACE_ALL.astype(np.float32),(0,0),1.0)
print('split base',feats(det,adet,'padrao'))
save('corpo-linhas',det,adet*(1-fall))
save('corpo-pele',np.dstack([g,g,g]),askin,'tint-pele')
for f in ['estrela','coracao','triste','alegre','pisca','surpresa','sono','confiante']:
    E=load('f-'+f+'.jpg'); Ew,_,cc=register(E,B,HEAD)
    if cc<0.5: Ew=E.copy(); cc=-1
    Ew=despill(Ew)
    d,a=detail(Ew,chroma_alpha(Ew)); print(f,'ecc',round(cc,3),'split',feats(d,a,f))
SKIN_EST=Sest
labB=cv2.cvtColor(B.astype(np.uint8),cv2.COLOR_BGR2LAB).astype(np.float32)
wm=(labB[...,0]>190)&(np.hypot(labB[...,1]-128,labB[...,2]-128)<14)&(aB>0.5)
wm=keep_big(nd.binary_opening(wm,iterations=2),2000); wm=nd.binary_fill_holes(wm)
lw,_=nd.label(wm)
def comp(x,y): return nd.binary_dilation(lw==lw[y,x],iterations=4)&(aB>0.5)
TEE=comp(375+PX,700); SHORTS=comp(300+PX,880)|comp(450+PX,880)
def unskin(rgb,a):
    p,_=skin_p(rgb); p,use=line_unmix(rgb,SKIN_EST,p); pp=p[...,None]
    c=np.clip((rgb-pp*SKIN_EST)/np.maximum(1-pp,0.05),0,255); c=np.where(use[...,None],O,c); return c,a*(1-p)
head_c=(375.+PX,330.)
def radial(m,cxy,angs):
    out=[]
    for t in angs:
        r=np.arange(0,420); x=(cxy[0]+r*np.cos(t)).astype(int); y=(cxy[1]+r*np.sin(t)).astype(int)
        ok=(x>=0)&(x<W)&(y>=0)&(y<H); v=np.zeros_like(r,bool); v[ok]=m[y[ok],x[ok]]
        out.append(r[v].max() if v.any() else 0)
    return np.array(out,float)
# cabelo: frente = dentro da silhueta da cabeca (acima do queixo); tras = resto + preenchimento sob o corpo
HEADSIL=nd.binary_dilation(aB>0.5,iterations=9)&box(0,548,0,W)
EARZ=box(335,488,240,332)|box(330,475,702,770)
HEADSIL&=~EARZ
hf=cv2.GaussianBlur(HEADSIL.astype(np.float32),(0,0),1.5)
for k in ['franjareta','rabo','trancas','ondulado']: P['cabelo-'+k]=(k,'head',0,1000)
def hair(n):
    if n=='cabelo-rabo':
        P[n]=('rabo','body',0,1000); old=extrair.BODY; extrair.BODY=HEAD|BODY
        rgb,a,cc=extrair.extract(n); extrair.BODY=old
    else: rgb,a,cc=extrair.extract(n)
    angs=np.radians(np.linspace(-180,0,37))
    rB=radial(aB>0.5,head_c,angs); rH=radial(a>0.5,head_c,angs)
    req=np.clip((rB+12)/np.maximum(rH,1),1.0,1.4); req[rH<0.4*rB]=1.0
    req=np.convolve(np.pad(req,3,mode='edge'),np.ones(7)/7,'valid')
    yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
    dx=xx-head_c[0]; dy=yy-head_c[1]; th=np.arctan2(dy,dx); r=np.hypot(dx,dy)
    kt=np.interp(th,angs,req,left=1.0,right=1.0); kt=np.where(dy<0,kt,1.0)
    src_r=r/kt
    mx=(head_c[0]+src_r*np.cos(th)).astype(np.float32); my=(head_c[1]+src_r*np.sin(th)).astype(np.float32)
    pm=cv2.remap(np.dstack([rgb*a[...,None],a]).astype(np.float32),mx,my,cv2.INTER_LINEAR)
    a=np.clip(pm[...,3],0,1); rgb=pm[...,:3]/np.maximum(a,1e-3)[...,None]
    rgb,a=unskin(rgb,a)
    hl=lum(cv2.bilateralFilter(np.clip(rgb,0,255).astype(np.uint8),5,30,5).astype(np.float32))
    Lh=np.median(hl[a>0.9]); gg=np.clip(hl/Lh*232,40,255)
    edge=(a<0.95)|~nd.binary_erosion(a>0.5,iterations=2)
    gg=np.where(edge,np.minimum(gg,200),gg)
    # buracos (ex.: sobrancelha da base sob a franja) -> preenche com o cabelo vizinho
    hole=nd.binary_fill_holes(a>0.5)&~(a>0.5)&HEADSIL
    hole=nd.binary_dilation(hole,iterations=2)&nd.binary_fill_holes(a>0.5)
    _,(qy,qx)=nd.distance_transform_edt(hole|(a<0.9),return_indices=True)
    gg=np.where(hole,gg[qy,qx],gg); a=np.where(hole,1.0,a)
    gr=np.dstack([gg,gg,gg])
    st=n.replace('cabelo-','')
    save('cabelo-frente-'+st,gr,a*hf,'tint-cabelo')
    hm=a>0.5; bs=aB>0.5
    un=nd.binary_closing(hm|bs,iterations=12)
    add=(un&~hm&~bs)|(bs&nd.binary_dilation(hm,iterations=30)); add&=nd.binary_dilation(hm,iterations=30)
    _,(iy,ix)=nd.distance_transform_edt(~(a>0.9),return_indices=True)
    grt=np.where(add[...,None],gr[iy,ix],gr)
    at=np.maximum(a,cv2.GaussianBlur(add.astype(np.float32),(0,0),0.8)*add)
    # tras: tudo menos o que fica dentro da cabeca (coberto pela frente)
    inner=cv2.GaussianBlur(nd.binary_erosion(HEADSIL,iterations=14).astype(np.float32),(0,0),2)
    yy2,xx2=np.mgrid[0:H,0:W]
    disc=(np.hypot(xx2-295,yy2-452)<32)|(np.hypot(xx2-710,yy2-428)<30)
    _,(jy,jx)=nd.distance_transform_edt(disc|(at<0.9),return_indices=True)
    grt=np.where(disc[...,None]&(at[...,None]>0.05),grt[jy,jx],grt)
    at=np.where(disc&(at>0.05),np.maximum(at,at[jy,jx]),at)
    save('cabelo-tras-'+st,grt,at*(1-inner),'tint-cabelo')
    print('hair',n,cc)
# pecas genericas
def generic(n,f,reg,yr,xr=None,ref=None,sel=None,need=None,dil=3):
    E=load(f); R=B if ref is None else ref
    Ew,M,cc=register(E,B,HEAD if reg=='head' else BODY)
    aE=chroma_alpha(Ew)
    d=np.abs(cv2.GaussianBlur(Ew,(0,0),1.5)-cv2.GaussianBlur(R,(0,0),1.5)).max(-1)
    m=(d>45)&(aE>0.5)
    labE=cv2.cvtColor(np.clip(Ew,0,255).astype(np.uint8),cv2.COLOR_BGR2LAB).astype(np.float32)
    if sel is not None: m&=sel(labE)
    Z=box(yr[0],yr[1],*(xr or (0,W))); m&=Z
    m=nd.binary_opening(m,iterations=1); m=keep_big(m,150)
    m=nd.binary_closing(m,iterations=4); m=nd.binary_fill_holes(m)
    m=nd.binary_dilation(m,iterations=dil)&(aE>0.02)&Z
    a=np.minimum(cv2.GaussianBlur(m.astype(np.float32),(0,0),0.8),aE)
    rgb,a=unskin(despill(Ew),a)
    if need is not None:
        gap=need&(a<0.5); solid=a>0.9
        _,(iy,ix)=nd.distance_transform_edt(~solid,return_indices=True)
        rgb=np.where(gap[...,None],rgb[iy,ix],rgb); a=np.maximum(a,cv2.GaussianBlur(gap.astype(np.float32),(0,0),0.6)*(aB>0.3))
    save(n,rgb,a); print(n,'ecc',round(cc,3)); return rgb,a
if __name__=='__main__' and 'faces' not in sys.argv:
  if 'rabo' in sys.argv: hair('cabelo-rabo')
  else:
        for n in ['cabelo-liso','cabelo-coquinhos','cabelo-cacheado','cabelo-franjareta','cabelo-rabo','cabelo-trancas','cabelo-ondulado']: hair(n)
        gold=lambda L:(L[...,2]>150)&(L[...,1]<160)
        nongold=lambda L:~((L[...,2]>150)&(L[...,1]<150))
        generic('casaco-lilas','e-casaco.jpg','body',(520,940),dil=3)
        generic('roupa-baixo-short-jeans','e-shortmeias.jpg','body',(780,1010),need=SHORTS)
        generic('meias-listradas','e-shortmeias.jpg','body',(1000,1265),ref=body*0+np.where((np.arange(H)>1040)[:,None,None],Dw,B))
        generic('acessorio-tiara','e-acess.jpg','head',(0,245))
        generic('acessorio-brincos-estrela','e-acess.jpg','head',(380,500),sel=gold,ref=body)
        generic('acessorio-colar-coracao','e-acess.jpg','body',(540,660),xr=(400,660),sel=gold,dil=1)
        generic('acessorio-bolsa-rosa','e-acess.jpg','body',(540,900),sel=nongold)
        generic('acessorio-presilha-laura','e-presilha.jpg','head',(120,270),xr=(250,480))
        # brincos dourados do corpo base (argola/bolinha)
        g2=(labB[...,2]>150)&EARS&(aB>0.3); g2=nd.binary_dilation(keep_big(g2,40),iterations=3)&(aB>0.05)
        rgb,a=unskin(despill(B),np.minimum(cv2.GaussianBlur(g2.astype(np.float32),(0,0),0.8),aB)); save('acessorio-brincos-bolinha',rgb,a)
        json.dump(INFO,open('/tmp/info_v2.json','w'),indent=1)
