from lib import *
import sys, json
B=load('base.jpg'); H,W_=B.shape[:2]
aB=chroma_alpha(B)
HEAD=np.zeros((H,W_),np.uint8); HEAD[250:520,250+PX:550+PX]=255   # inner face (eyes, nose, mouth)
BODY=np.zeros((H,W_),np.uint8); BODY[560:1240,100+PX:640+PX]=255
# piece: file, reg, y0,y1, diff thr, extra
P={
 'roupa-cima-lilas-estrela':('camiseta','body',540,860),
 'roupa-cima-listras-rosa':('listras','body',540,860),
 'roupa-baixo-saia-roxa':('saia','body',740,1000),
 'roupa-baixo-calca-jeans':('jeans','body',780,1160),
 'vestido-rosa':('vestido','body',540,1010),
 'calcado-tenis-branco':('tenis','body',1088,1250),
 'calcado-sapatilha-rosa':('sapatilha','body',1080,1250),
 'acessorio-oculos-vermelho':('oculos','head',280,460),
 'acessorio-laco-rosa':('laco','head',20,360),
 'acessorio-bone-lilas':('bone','head',20,360),
 'cabelo-liso':('liso','head',0,900),
 'cabelo-coquinhos':('coquinhos','head',0,700),
 'cabelo-cacheado':('cacheado','head',0,800),
}
def extract(name):
    f,reg,y0,y1=P[name]
    E=load('e-'+f+'.jpg')
    Ew,M,cc=register(E,B,HEAD if reg=='head' else BODY)
    aE=chroma_alpha(Ew)
    d=np.abs(cv2.GaussianBlur(Ew,(0,0),1.5)-cv2.GaussianBlur(B,(0,0),1.5)).max(-1)
    m=(d>45)&(aE>0.5)
    labE=cv2.cvtColor(np.clip(Ew,0,255).astype(np.uint8),cv2.COLOR_BGR2LAB).astype(np.float32)
    labB=cv2.cvtColor(B.astype(np.uint8),cv2.COLOR_BGR2LAB).astype(np.float32)
    pE,_=skin_p(Ew)
    if name.startswith('cabelo'):
        hc=(labE[...,0]<125)&(aE>0.5)&(pE<0.3)
        face=np.zeros_like(hc); face[230:540,220+PX:580+PX]=1
        hc&=~(face&(labB[...,0]<150))   # brows/eyes/mouth of the base
        hc&=~(labE[...,2]>178)   # earrings
        sil=aB>0.5; edge=nd.binary_dilation(sil,iterations=7)&~nd.binary_erosion(sil,iterations=7)
        lowbody=np.zeros_like(hc); lowbody[545:]=1
        hc&=~(lowbody&edge&(labE[...,0]<45)&(labE[...,2]<=132))
        hc&=~(lowbody&nd.binary_erosion(sil,iterations=6))   # nothing inside the torso/arms
        low=hc&lowbody; br=keep_big(nd.binary_opening(low&(labE[...,2]>133)&(labE[...,0]>14),iterations=3),800)
        core=nd.binary_opening(hc,iterations=3)
        hc=nd.binary_dilation(core,iterations=4)&hc
        hc=nd.binary_closing(hc,iterations=2)
        m=keep_big(hc,4000)
    elif 'oculos' in name:
        r=(labE[...,1]>163)&(labE[...,2]<165)&(labE[...,0]<170)&(aE>0.5)
        m=keep_big(nd.binary_closing(r,iterations=2),200)
        m=nd.binary_dilation(m,iterations=2)
    elif name.startswith('calcado-tenis'):
        m=(aE>0.5)&(pE<0.4)
    if name.startswith(('roupa','vestido')):
        import build_regions as R
        pE2,_=skin_p(Ew)
        reg_=R.need(name)
        if reg_ is not None: m|=reg_&(aE>0.5)&(pE2<0.5)
    m[:y0]=0; m[y1:]=0
    m=nd.binary_opening(m,iterations=2)
    m=keep_big(m,1500 if name.startswith(('cabelo','roupa','vest')) else 300)
    if not name.startswith(('cabelo','acessorio-oculos')):
        m=nd.binary_closing(m,iterations=4); m=nd.binary_fill_holes(m)
    m=nd.binary_dilation(m,iterations=3 if 'oculos' not in name else 1)&(aE>0.02)
    m[:y0]=0; m[y1:]=0
    soft=cv2.GaussianBlur(m.astype(np.float32),(0,0),0.8)
    a=np.minimum(soft,aE)
    rgb=despill(Ew)
    # remove leftover skin (from dilation) by unmixing against skin
    p,L=skin_p(rgb)
    if not name.startswith('vestido') and 'sapatilha' not in name: pass
    a=a*(1-p)
    if name.startswith('cabelo'): print('M',M.round(3).tolist())
    return rgb,a,cc
if __name__=='__main__':
    out={}
    for n in (sys.argv[1:] or P):
        rgb,a,cc=extract(n); print(n,'ecc',cc)
        np.save('/tmp/pc_'+n+'.npy',np.dstack([rgb,a*255]).astype(np.float32))
        comp=B*(1-a[...,None])+rgb*a[...,None]
        chk=np.where(a[...,None]>0, rgb*a[...,None]+np.array([255,0,255])*(1-a[...,None]), 40)
        cv2.imwrite('/tmp/dbg_'+n+'.jpg',np.hstack([comp,chk]).astype(np.uint8))
