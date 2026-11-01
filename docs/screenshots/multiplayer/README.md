# Multiplayer com amigos

Capturas do jogo em desenvolvimento, conectado ao Supabase real. As três contas
usavam apenas dados fictícios e foram removidas depois dos testes, junto com suas
salas. Os códigos mostrados não são convites ativos.

- [Aprovação pelo responsável](1-aprovacao.png).
- [Dois jogadores no celular](2-dois-jogadores-mobile.png).
- [Terceiro jogador aguardando aprovação](3-aguardando.png).
- [Amigo no balanço, com câmera acompanhando](4-amigo-balanco.png).
- [Reconectando após interrupção da rede](5-reconectando.png).

Duas contas aprovadas trocaram frase em 148 ms e aceno em 72 ms nessa execução.
A terceira conta não recebeu eventos nem conseguiu entregar mensagem por HTTP.
Após restaurar a rede, a sala e os movimentos voltaram. Não houve erros JavaScript
não tratados. Estas medições não garantem a latência em outras redes.
