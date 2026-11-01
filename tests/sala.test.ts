import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
const api=vi.hoisted(()=>({rpc:vi.fn(),from:vi.fn(),channel:vi.fn(),removeChannel:vi.fn(),auth:{getSession:vi.fn()},realtime:{setAuth:vi.fn()}}));
vi.mock('../src/net/supabase',()=>({supabase:api}));
import { AmigosSala } from '../src/net/sala';

const usuario='11111111-1111-4111-8111-111111111111', outro='22222222-2222-4222-8222-222222222222';
const sala={id:'33333333-3333-4333-8333-333333333333',codigo:'ABCDEF',dono_id:usuario,ativa:true,versao:1};
class CanalFake {
  state='joined';
  send=vi.fn().mockResolvedValue('ok');track=vi.fn().mockResolvedValue('ok');
  on(): this {return this}
  subscribe(callback:(valor:string)=>void):this {queueMicrotask(()=>callback('SUBSCRIBED'));return this}
}
let aprovado=true;let canais:CanalFake[]=[];let amigos:AmigosSala;
beforeEach(()=>{
  vi.clearAllMocks();aprovado=true;canais=[];
  api.rpc.mockImplementation(async(nome:string)=>({data:nome==='listar_membros_sala'?[{user_id:usuario,apelido:'Estrela',cabelo:'liso',aprovado:true}]:sala,error:null}));
  api.from.mockImplementation(()=>{const consulta={select:()=>consulta,eq:()=>consulta,maybeSingle:async()=>({data:{aprovado},error:null})};return consulta;});
  api.auth.getSession.mockResolvedValue({data:{session:{access_token:'token-de-teste'}}});api.realtime.setAuth.mockResolvedValue(undefined);
  api.channel.mockImplementation(()=>{const c=new CanalFake();canais.push(c);return c});api.removeChannel.mockResolvedValue('ok');
  amigos=new AmigosSala();amigos.configurar(usuario,'Estrela');
});
afterEach(()=>amigos.esquecer());

describe('ciclo da sala com transporte simulado',()=>{
  it('uma conta pendente não abre canais nem compartilha estado',async()=>{
    aprovado=false;await amigos.pedir('abcdef');
    expect(amigos.fase).toBe('aguardando');expect(api.channel).not.toHaveBeenCalled();expect(amigos.enviarFrase('oi')).toBe(false);
  });
  it('retoma depois de uma falha HTTP sem exigir a queda do WebSocket',async()=>{
    await amigos.criar();await vi.waitFor(()=>expect(amigos.fase).toBe('conectado'));
    api.rpc.mockResolvedValueOnce({data:null,error:new Error('sem rede')});
    await amigos.atualizar();expect(amigos.fase).toBe('reconectando');
    await amigos.atualizar();expect(amigos.fase).toBe('conectado');
  });
  it('não aceita id de texto livre e envia somente o id permitido',async()=>{
    await amigos.criar();await vi.waitFor(()=>expect(amigos.fase).toBe('conectado'));
    expect(amigos.enviarFrase('texto livre')).toBe(false);expect(amigos.enviarFrase('Oi!')).toBe(false);
    expect(amigos.enviarFrase('oi')).toBe(true);
    expect(canais[0].send).not.toHaveBeenCalled();
    expect(canais[1].send).toHaveBeenCalledWith({type:'broadcast',event:'frase',payload:{id:'oi'}});
    amigos.pausar();expect(amigos.enviarFrase('tchau')).toBe(false);
  });
  it('ignora a resposta de criação se a conta mudou enquanto aguardava',async()=>{
    let resolver!:(valor:unknown)=>void;
    api.rpc.mockImplementationOnce(()=>new Promise(resolve=>{resolver=resolve}));
    const criacao=amigos.criar();amigos.configurar(outro,'Lua');resolver({data:sala,error:null});await criacao;
    expect(amigos.sala).toBeNull();expect(api.channel).not.toHaveBeenCalled();
  });
  it('tenta abrir novamente se a sessão estava ausente na primeira consulta',async()=>{
    api.auth.getSession.mockResolvedValueOnce({data:{session:null}});
    await amigos.criar();expect(amigos.fase).toBe('reconectando');expect(api.channel).not.toHaveBeenCalled();
    await amigos.atualizar();await vi.waitFor(()=>expect(amigos.fase).toBe('conectado'));
  });
});
