import cv2, numpy as np
from scipy import ndimage as nd
G='/workspace/laura-jogo/criador-poc/gen/'
PX=120
def load(n):
    im=cv2.imread(G+n)
    im=cv2.copyMakeBorder(im,0,0,PX,PX,cv2.BORDER_CONSTANT,value=(0,255,0))
    return im.astype(np.float32)
def chroma_alpha(I):
    b,g,r=I[...,0],I[...,1],I[...,2]
    gr=g-np.maximum(r,b)          # green excess
    a=np.clip((140-gr)/70,0,1)    # 1=fg
    # flood: only bg connected to border counts as bg
    bgc=gr>90
    lab,_=nd.label(bgc); border=np.unique(np.r_[lab[0],lab[-1],lab[:,0],lab[:,-1]]); border=border[border>0]
    bgm=np.isin(lab,border)
    a=np.where(bgm&(gr>110),0,a)
    a=np.where(~bgm&(gr<=90),1,a)
    return a
def despill(I):
    I=I.copy(); m=np.maximum(I[...,0],I[...,2]); I[...,1]=np.minimum(I[...,1],m+30); return I
SK=np.array([157.,169.])
def skin_p(I):
    lab=cv2.cvtColor(np.clip(I,0,255).astype(np.uint8),cv2.COLOR_BGR2LAB).astype(np.float32)
    d=np.hypot(lab[...,1]-SK[0],lab[...,2]-SK[1])
    p=np.clip((15-d)/7,0,1)*np.clip((lab[...,0]-100)/30,0,1)
    return p,lab[...,0]
def register(E,B,mask):
    """ECC affine E->B using mask region (uint8) in B coords; returns warped E and matrix."""
    def g(x): return cv2.GaussianBlur(cv2.cvtColor(x.astype(np.uint8),cv2.COLOR_BGR2GRAY),(0,0),2).astype(np.float32)
    W=np.eye(2,3,dtype=np.float32)
    best=None
    for sc in [0.25,0.5,1.0]:
        b=cv2.resize(g(B),None,fx=sc,fy=sc); e=cv2.resize(g(E),None,fx=sc,fy=sc); m=cv2.resize(mask,None,fx=sc,fy=sc,interpolation=cv2.INTER_NEAREST)
        Ws=W.copy(); Ws[:,2]*=sc
        try:
            cc,Ws=cv2.findTransformECC(b,e,Ws,cv2.MOTION_AFFINE,(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,200,1e-6),m,5)
        except cv2.error as ex: print('ecc fail',sc,ex); continue
        W=Ws.copy(); W[:,2]/=sc; best=cc
    h,w=B.shape[:2]
    Ew=cv2.warpAffine(E,W,(w,h),flags=cv2.INTER_LINEAR+cv2.WARP_INVERSE_MAP,borderMode=cv2.BORDER_REPLICATE)
    return Ew,W,best
def keep_big(m,minsz):
    lab,n=nd.label(m)
    if not n: return m
    sz=nd.sum(m,lab,range(1,n+1)); return np.isin(lab,[i+1 for i,s in enumerate(sz) if s>=minsz])
