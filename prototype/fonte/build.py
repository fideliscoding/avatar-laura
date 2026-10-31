import base64,io,json,os
from PIL import Image
P='/workspace/laura-jogo/v3/'
def enc(path,maxw=None,maxh=None,q=86):
    im=Image.open(path);im=im.convert('RGBA') if 'png' in path else im.convert('RGB')
    if maxh and im.height>maxh: im=im.resize((round(im.width*maxh/im.height),maxh),Image.LANCZOS)
    if maxw and im.width>maxw: im=im.resize((maxw,round(im.height*maxw/im.width)),Image.LANCZOS)
    b=io.BytesIO();im.save(b,'WEBP',quality=q,method=6);return 'data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()
I={'bg':enc(P+'src/bg.jpg',q=85)}
names={'cabelo1':'cabelo1-liso','cabelo2':'cabelo2-rabo','cabelo3':'cabelo3-trancas','cabelo4':'cabelo4-cacheado','cabelo5':'cabelo5-coque','cabelo6':'cabelo6-coquinhos'}
for k,v in names.items(): I[k]=enc(P+f'png/{v}.png',maxh=600,q=90)
m={'lado':'laura-lado','pedro_triste':'pedro-triste','pedro_feliz':'pedro-feliz','bia':'bia','vovo':'vovo','frame':'balanco-estrutura','assento':'balanco-assento','escorregador':'escorregador','gangorra':'gangorra','carrossel':'carrossel','sorvete':'sorvete','carrinho':'carrinho'}
for k,v in m.items(): I[k]=enc(P+f'png/{v}.png',maxh=520,q=90)
font=base64.b64encode(open('/usr/share/fonts/truetype/sand-box/google/Fredoka/Fredoka-VariableFont_wdth,wght.ttf','rb').read()).decode()
h=open(P+'build/game.html').read().replace('__FONT__',font).replace('__IMGS__',json.dumps(I))
open(P+'my-town-my-world.html','w').write(h);print(os.path.getsize(P+'my-town-my-world.html')/1e6,'MB')
