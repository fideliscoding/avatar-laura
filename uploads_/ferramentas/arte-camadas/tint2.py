# tint por mapa de luz em HSL (mesma formula do index.html): sombras ficam saturadas, sem acinzentar
import numpy as np
O=np.array([0.10,0.08,0.14])
def hex2(h): return np.array([int(h[i:i+2],16) for i in (1,3,5)])/255
def rgb2hsl(c):
    mx,mn=c.max(),c.min(); l=(mx+mn)/2
    if mx==mn: return 0.,0.,l
    d=mx-mn; s=d/(2-mx-mn) if l>0.5 else d/(mx+mn)
    r,g,b=c
    h=((g-b)/d+(6 if g<b else 0)) if mx==r else ((b-r)/d+2 if mx==g else (r-g)/d+4)
    return h/6,s,l
def hsl2rgb(h,s,l):
    q=np.where(l<0.5,l*(1+s),l+s-l*s); p=2*l-q
    def f(t):
        t=t%1
        return np.where(t<1/6,p+(q-p)*6*t,np.where(t<1/2,q,np.where(t<2/3,p+(q-p)*(2/3-t)*6,p)))
    return np.stack([f(h+1/3),f(h),f(h-1/3)],-1)
def tint(rgba,hexc,ref,sb=None):
    sb=(0 if ref==242 else 0.30) if sb is None else sb
    v=rgba[...,0]; v0=ref/255; t=v/v0
    h,s,l=rgb2hsl(hex2(hexc))
    dark=t<=1
    L=np.where(dark,l*np.clip(t,0,1)**1.05,l+(1-l)*np.clip((t-1)/max(1/v0-1,1e-3),0,1)*0.75)
    S=np.where(dark,np.minimum(1,s+(1-np.clip(t,0,1))*sb),s)
    out=hsl2rgb(h,S,L)
    w=np.clip(1-v/0.24,0,1)[...,None]
    out=out*(1-w)+O*w
    r=rgba.copy(); r[...,:3]=out; return r
