export const APPS_CELULAR=['Personagens','Mapa','Amigos','Moedas','Sair'] as const;
export type AppCelular=typeof APPS_CELULAR[number];
export type EstadoCelular={tela:'fechado'|'inicio'}|{tela:'app';app:AppCelular}|{tela:'confirmar-saida'};
export type EventoCelular={tipo:'abrir'|'fechar'|'voltar'|'confirmar'}|{tipo:'app';app:AppCelular};
export function navegarCelular(estado:EstadoCelular,evento:EventoCelular):{estado:EstadoCelular;sair:boolean}{
 if(evento.tipo==='confirmar')return {estado:{tela:'fechado'},sair:estado.tela==='confirmar-saida'};
 if(evento.tipo==='fechar')return {estado:{tela:'fechado'},sair:false};
 if(evento.tipo==='abrir')return {estado:{tela:'inicio'},sair:false};
 if(evento.tipo==='voltar')return {estado:{tela:estado.tela==='inicio'?'fechado':'inicio'},sair:false};
 if(evento.tipo!=='app')return {estado,sair:false};
 if(estado.tela==='fechado')return {estado,sair:false};
 return {estado:evento.app==='Sair'?{tela:'confirmar-saida'}:{tela:'app',app:evento.app},sair:false};
}
