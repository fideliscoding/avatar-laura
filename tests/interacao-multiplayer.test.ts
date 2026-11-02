import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
const api=vi.hoisted(()=>({rpc:vi.fn(),from:vi.fn()}));
vi.mock('../src/net/supabase',()=>({supabase:api}));
import {ObjetosSync,encerrarObjetos,validarPedidoRede,type SalaObjetos} from '../src/net/objetosSync';
import {estadoEfetivo} from '../src/game/interacao/travas';
import type {EstadoObjeto} from '../src/game/interacao/tipos';
import type {EventoObjetoSala} from '../src/net/sala';
const dono='11111111-1111-4111-8111-111111111111',amigo='22222222-2222-4222-8222-222222222222';
let salas:SalaFake[]=[];let banco:Map<string,EstadoObjeto>;
class SalaFake implements SalaObjetos{
 usuario:string;fase='conectado' as const;sala={id:'33333333-3333-4333-8333-333333333333',codigo:'ABCDEF',dono_id:dono,ativa:true,versao:1};
 membros=[{user_id:dono,apelido:'Laura',cabelo:'liso',aprovado:true},{user_id:amigo,apelido:'Bia',cabelo:'rabo',aprovado:true}];
 instancia='';ouvintes=new Set<(autor:string,event:EventoObjetoSala,dados:unknown)=>void>();
 constructor(usuario:string){this.usuario=usuario;salas.push(this)}
 registrarInstanciaInteracao(i:string):void{this.instancia=i}
 instanciasInteracao(u:string):string[]{return salas.filter(s=>s.usuario===u).map(s=>s.instancia).sort()}
 observarInteracoes(fn:(autor:string,event:EventoObjetoSala,dados:unknown)=>void):()=>void{this.ouvintes.add(fn);return()=>this.ouvintes.delete(fn)}
 enviarInteracao(event:EventoObjetoSala,dados:unknown):boolean{for(const s of salas)if(s!==this)for(const fn of s.ouvintes)queueMicrotask(()=>fn(this.usuario,event,dados));return true}
 fechar():void{salas=salas.filter(s=>s!==this);this.ouvintes.clear()}
}
beforeEach(()=>{
 vi.useFakeTimers();vi.setSystemTime(1800000000000);vi.clearAllMocks();salas=[];banco=new Map();
 api.from.mockReturnValue({update:()=>({eq:()=>Promise.resolve({error:null})})});
 api.rpc.mockImplementation(async(nome:string,args:{p_dono?:string;p_estados?:{id:string;base:number;estado:EstadoObjeto}[]})=>{
  if(nome==='ler_objetos')return {data:{estados:args.p_dono===dono?[...banco.values()]:[],agora:Date.now()},error:null};
  const lote=args.p_estados!;if(lote.some(p=>p.base!==(banco.get(p.id)?.versao??0)))return {data:null,error:{code:'40001'}};
  for(const p of lote)banco.set(p.id,{...p.estado,trava:p.estado.trava?{...p.estado.trava,ate:Date.now()+8000}:null});
  return {data:{estados:lote.map(p=>banco.get(p.id)),agora:Date.now()},error:null};
 });
});
afterEach(()=>{encerrarObjetos();vi.useRealTimers()});
describe('autoridade dos objetos na sala de convite',()=>{
 it('duas contas disputam a mesma versão e somente uma recebe posse',async()=>{
  const a=new ObjetosSync(dono,null,new SalaFake(dono)),b=new ObjetosSync(amigo,null,new SalaFake(amigo));
  const resultados=await Promise.all([a.pedir({objeto:'sorvete-parque',tipo:'pegar',versao:0}),b.pedir({objeto:'sorvete-parque',tipo:'pegar',versao:0})]);
  expect(resultados.filter(r=>r.aceita)).toHaveLength(1);
  expect(api.rpc.mock.calls.filter(c=>c[0]==='guardar_objetos')).toHaveLength(1);
  expect(a.ler().find(s=>s.id==='sorvete-parque')!.trava).toEqual(b.ler().find(s=>s.id==='sorvete-parque')!.trava);
  expect(resultados.find(r=>!r.aceita)!.efeitos[0]).toMatchObject({tipo:'fala',codigo:'ocupado'});
 });
 it('duas abas do dono elegem só uma autoridade e não duplicam o sorvete',async()=>{
  const a=new ObjetosSync(dono,null,new SalaFake(dono)),b=new ObjetosSync(dono,null,new SalaFake(dono));
  const r=await Promise.all([a.pedir({objeto:'sorvete-parque',tipo:'pegar',versao:0}),b.pedir({objeto:'sorvete-parque',tipo:'pegar',versao:0})]);
  expect(r.filter(r=>r.aceita)).toHaveLength(1);expect(api.rpc.mock.calls.filter(c=>c[0]==='guardar_objetos')).toHaveLength(1);
 });
 it('ignora confirmação de um membro que não é a autoridade',async()=>{
  const sa=new SalaFake(dono),sb=new SalaFake(amigo),a=new ObjetosSync(dono,null,sa),b=new ObjetosSync(amigo,null,sb);
  await a.pedir({objeto:'sorvete-parque',tipo:'pegar',versao:0});
  const forjado=a.ler().map(s=>s.id==='sorvete-parque'?{...s,versao:999,trava:{jogador:amigo,instancia:b.instancia,ate:Date.now()+8000}}:s);
  sb.enviarInteracao('confirma',{pedido:crypto.randomUUID(),instancia:a.instancia,aceita:true,estados:forjado,agora:Date.now()});await Promise.resolve();
  expect(a.ler().find(s=>s.id==='sorvete-parque')!.trava?.jogador).toBe(dono);
 });
 it('o leitor projeta a queda em oito segundos mesmo se a autoridade sair',async()=>{
  const sa=new SalaFake(dono),a=new ObjetosSync(dono,null,sa),b=new ObjetosSync(amigo,null,new SalaFake(amigo));
  await a.pedir({objeto:'sorvete-parque',tipo:'pegar',versao:0});a.encerrar();sa.fechar();
  await vi.advanceTimersByTimeAsync(8001);const s=b.ler().find(s=>s.id==='sorvete-parque')!;
  expect(estadoEfetivo(s,b.agora())).toMatchObject({local:'chao',trava:null,x:1060,y:425});
 });
 it('não aceita texto livre, ação desconhecida ou ponto inválido no pedido',()=>{
  const p={id:crypto.randomUUID(),instancia:crypto.randomUUID(),objeto:'sorvete-parque',tipo:'pegar',versao:0};expect(validarPedidoRede(p)).toBe(true);
  for(const extra of [{tipo:'conversar'},{objeto:'mensagem livre'},{ponto:0},{ponto:{x:Infinity,y:0}},{mochila:'sim'},{item:'texto livre'}])expect(validarPedidoRede({...p,...extra})).toBe(false);
 });
 it('confirma cada mudança da água no banco antes de anunciar a próxima versão',async()=>{
  const a=new ObjetosSync(dono,null,new SalaFake(dono)),b=new ObjetosSync(amigo,null,new SalaFake(amigo));
  await vi.advanceTimersByTimeAsync(500);
  expect((await b.pedir({objeto:'bebedouro-parque',tipo:'tocar',versao:0,ligado:true})).aceita).toBe(true);
  expect(banco.get('bebedouro-parque')).toMatchObject({ligado:true,versao:1});
  expect((await a.pedir({objeto:'bebedouro-parque',tipo:'tocar',versao:1,ligado:false})).aceita).toBe(true);
  expect(banco.get('bebedouro-parque')).toMatchObject({ligado:false,versao:2});
 });
 it('não dá outra mordida ao repetir uma confirmação atrasada do mesmo consumo',async()=>{
  const a=new ObjetosSync(dono,null,new SalaFake(dono));new ObjetosSync(amigo,null,new SalaFake(amigo));
  await a.pedir({objeto:'sorvete-parque',tipo:'pegar',versao:0});
  const pedido={objeto:'sorvete-parque',tipo:'comer' as const,versao:1,mordidas:0};
  expect((await a.pedir(pedido)).aceita).toBe(true);
  expect((await a.pedir(pedido)).aceita).toBe(true);
  expect(banco.get('sorvete-parque')!.mordidas).toBe(1);
 });
});
