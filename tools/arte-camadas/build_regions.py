from lib import *
B=load('base.jpg'); aB=chroma_alpha(B)
labB=cv2.cvtColor(B.astype(np.uint8),cv2.COLOR_BGR2LAB).astype(np.float32)
wm=(labB[...,0]>190)&(np.hypot(labB[...,1]-128,labB[...,2]-128)<14)&(aB>0.5)
wm=keep_big(nd.binary_opening(wm,iterations=2),2000); wm=nd.binary_fill_holes(wm)
lw,_=nd.label(wm)
def comp(x,y): return (lw==lw[y,x])
TEE=comp(375+PX,700); SHORTS=comp(300+PX,880)|comp(450+PX,880)
def need(n):
    if n.startswith('roupa-cima'): return TEE
    if n.startswith('roupa-baixo'): return SHORTS
    if n.startswith('vestido'): return TEE|SHORTS
