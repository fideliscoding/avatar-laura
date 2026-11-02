import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
const api=vi.hoisted(()=>({rpc:vi.fn(),from:vi.fn()}));
vi.mock('../src/net/supabase',()=>({supabase:api}));
import {ObjetosSync,encerrarObjetos,validarQuadro} from '../src/net/objetosSync';
import type {EstadoObjeto} from '../src/game/interacao/tipos';
import type {Armazenamento} from '../src/game/estado';
const uid='11111111-1111-4111-8111-111111111111';
function memoria():Armazenamento{const m=new Map<string,string>();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>{m.set(k,v)}}}
beforeEach(()=>{
 vi.useFakeTimers();vi.setSystemTime(1800000000000);vi.clearAllMocks();
 api.from.mockReturnValue({update:()=>({eq:()=>Promise.resolve({error:null})})});
 api.rpc.mockImplementation(async(nome:string,args:{p_estados?:{estado:EstadoObjeto}[]})=>({data:{estados:nome==='guardar_objetos'?args.p_estados?.map(p=>p.estado):[],agora:Date.now()},error:null}));
});
afterEach(()=>{encerrarObjetos();vi.useRealTimers()});
describe('persistência dos objetos',()=>{
 it('conserva o cache offline e não mistura convidado com conta',async()=>{
  const arm=memoria(),s=new ObjetosSync(null,arm);await s.pedir({objeto:'bebedouro-parque',tipo:'tocar',versao:0});s.encerrar();
  const volta=new ObjetosSync(null,arm);expect(volta.ler().find(s=>s.id==='bebedouro-parque')!.ligado).toBe(true);
  const conta=new ObjetosSync(uid,arm);expect(conta.ler().find(s=>s.id==='bebedouro-parque')!.ligado).toBe(false);
 });
 it('agrupa mudanças livres por um segundo e envia apenas a última versão',async()=>{
  const s=new ObjetosSync(uid,memoria());await s.pedir({objeto:'bebedouro-parque',tipo:'tocar',versao:0});await s.pedir({objeto:'bebedouro-parque',tipo:'tocar',versao:1});
  const gravacoes=()=>api.rpc.mock.calls.filter(c=>c[0]==='guardar_objetos');expect(gravacoes()).toHaveLength(0);
  await vi.advanceTimersByTimeAsync(999);expect(gravacoes()).toHaveLength(0);await vi.advanceTimersByTimeAsync(1);expect(gravacoes()).toHaveLength(1);
  expect(gravacoes()[0][1].p_estados[0]).toMatchObject({base:0,estado:{versao:2,ligado:false}});
 });
 it('só mostra a posse depois de confirmar a gravação crítica',async()=>{
  let resolver!:(v:unknown)=>void;const s=new ObjetosSync(uid,memoria());
  api.rpc.mockImplementation(async(nome:string,_args:{p_estados:{estado:EstadoObjeto}[]})=>nome==='guardar_objetos'?new Promise(resolve=>{resolver=resolve}):{data:{estados:[],agora:Date.now()},error:null});
  const pedido=s.pedir({objeto:'sorvete-parque',tipo:'pegar',versao:0});await vi.waitFor(()=>expect(resolver).toBeTypeOf('function'));
  expect(s.ler().find(s=>s.id==='sorvete-parque')!.local).toBe('chao');
  const lote=api.rpc.mock.calls.find(c=>c[0]==='guardar_objetos')![1].p_estados;
  resolver({data:{estados:lote.map((p:{estado:EstadoObjeto})=>p.estado),agora:Date.now()},error:null});expect((await pedido).aceita).toBe(true);expect(s.ler().find(s=>s.id==='sorvete-parque')!.local).toBe('mao');
 });
 it('descarta resposta recebida após fechar a sessão',async()=>{
  let resolver!:(v:unknown)=>void;api.rpc.mockImplementation(()=>new Promise(resolve=>{resolver=resolve}));const s=new ObjetosSync(uid,memoria());s.encerrar();resolver({data:{estados:[],agora:1},error:null});await Promise.resolve();expect(s.ler().every(s=>s.versao===0)).toBe(true);
 });
 it('recusa quadros sem relógio e estados malformados',()=>{for(const v of [null,{}, {estados:[],agora:Infinity},{estados:[{id:'sorvete-parque',local:'texto'}],agora:1}])expect(validarQuadro(v)).toBeNull()});
});
