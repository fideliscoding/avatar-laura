import json
C='/workspace/laura-jogo/criador-poc/camadas/'
old=json.load(open('/workspace/laura-jogo/criador-poc/camadas-v1-backup/ancoras.json'))
M=dict(old)
M['versao']=2
M['pose']='frente'
M['tint']={'formula':'mapa de luz HSL: t=cinza/ref; t<=1 -> L=Lcor*t^1.05, S=min(1,Scor+0.30*(1-t)); t>1 -> L=Lcor+(1-Lcor)*0.75*(t-1)/(1/ref-1); cinza<0.24 -> mistura com contorno #1A1424',
 'ref':{'pele':242,'cabelo':232,'peca':235}}
M['paletas']={
 'pele':['#FFE6D6','#FAD4BC','#F3C3A0','#F39D6A','#E8A27A','#D9A077','#C98A5E','#B0744A','#93603C','#77492C','#5C3822','#40261A'],
 'cabelo':['#2B1B14','#5A3522','#8A5A35','#B5462E','#D9A35B','#F0D58C','#FFF0B0','#E8E8F0','#B48DF0','#FF9EC8','#6FB7FF','#7ED6B5'],
 'peca':['#FFFFFF','#C9A8F5','#9B6FE0','#6B3FC0','#FF9EC8','#F0507A','#E83A3A','#FFB35C','#FFE070','#7ED6B5','#6FB7FF','#2E3A6E']}
M['laura']={'pele':'#F39D6A'}
M['ordem']=['cabelo-tras','corpo-pele','corpo-linhas','olhos','boca','sobrancelha','meias','roupa-baixo','roupa-cima|vestido','calcado','colar','casaco','bolsa','brincos','cabelo-frente','cabeca (tiara, presilha, laco, bone)','oculos']
M['categorias']={
 'cabeloFrente':{'camada':'cabelo-frente-{id}','tint':'cabelo','itens':['liso','coquinhos','cacheado','franjareta','rabo','trancas','ondulado']},
 'cabeloTras':{'camada':'cabelo-tras-{id}','tint':'cabelo','itens':['liso','coquinhos','cacheado','franjareta','rabo','trancas','ondulado'],'opcional':True},
 'olhos':{'camada':'olhos-{id}','itens':['padrao','estrela','coracao','alegre','pisca','surpresa','sono','confiante','triste']},
 'sobrancelha':{'camada':'sobrancelha-{id}','itens':['padrao','alegre','surpresa','sono','confiante','triste']},
 'boca':{'camada':'boca-{id}','itens':['padrao','alegre','coracao','pisca','surpresa','sono','confiante','triste']},
 'roupaCima':{'camada':'roupa-cima-{id}','cor':True,'itens':['lilas-estrela','listras-rosa'],'opcional':True},
 'roupaBaixo':{'camada':'roupa-baixo-{id}','cor':True,'itens':['saia-roxa','calca-jeans','short-jeans'],'opcional':True},
 'vestido':{'camada':'vestido-{id}','cor':True,'itens':['rosa'],'opcional':True,'substitui':['roupaCima','roupaBaixo']},
 'casaco':{'camada':'casaco-{id}','cor':True,'itens':['lilas'],'opcional':True},
 'meias':{'camada':'meias-{id}','cor':True,'itens':['listradas'],'opcional':True},
 'calcado':{'camada':'calcado-{id}','cor':True,'itens':['tenis-branco','sapatilha-rosa'],'opcional':True},
 'acessorios':{'camada':'acessorio-{id}','cor':True,'multi':True,'itens':['presilha-laura','tiara','laco-rosa','bone-lilas','oculos-vermelho','colar-coracao','brincos-bolinha','brincos-estrela','bolsa-rosa']}}
M['rostos']={'feliz':{'olhos':'alegre','boca':'alegre','sobrancelha':'alegre'},'triste':{'olhos':'triste','boca':'triste','sobrancelha':'triste'}}
M['arquivos_cor']='cada peca colorizavel tem {nome}.png (cor original) e {nome}-cinza.png (cinza com sombra e contorno, para tint)'
json.dump(M,open(C+'ancoras.json','w'),indent=1,ensure_ascii=False)
print(json.dumps(M,ensure_ascii=False)[:200])
