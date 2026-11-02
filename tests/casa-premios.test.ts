import {beforeEach,describe,expect,it,vi} from 'vitest';
vi.mock('../src/net/supabase',()=>({supabase:null}));
import {premiarCasa} from '../src/net/premiosCasa';
import {progresso} from '../src/game/estado';
beforeEach(()=>{const m=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>m.get(k)??null,setItem:(k:string,v:string)=>m.set(k,v)});progresso.moedas=0});
describe('recompensas do convidado offline',()=>{
 it('arrumar concede só uma moeda no mesmo dia e segredo só uma por descoberta',async()=>{
  expect(await premiarCasa('local','arrumar')).toBe('premiada');expect(await premiarCasa('local','arrumar')).toBe('repetida');
  expect(await premiarCasa('local','tapete')).toBe('premiada');expect(await premiarCasa('local','tapete')).toBe('repetida');expect(progresso.moedas).toBe(2);
 });
});
