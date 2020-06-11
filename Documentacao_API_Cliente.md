*Documentação API Cliente*
----

**change-password**
----
  Altera a senha do Cliente.

* **URL**

  /instalador/api/change-password/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ oldPassword: (string), newPassword: (string) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ error: 0, message: "" }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 404, message: "Senha inválida" }`


**check-new-messages**
----
  Retorna JSON com a quantidade de mensagens não lidas.

* **URL**

  /cliente/api/check-new-messages/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ id: (long) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ messageCount: (int) }`


**check-new-notifications**
----
  Retorna JSON com a quantidade de notificações não lidas.

* **URL**

  /cliente/api/check-new-notifications/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ id: (long) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ notificationCount: (int) }`


**check-panel-status**
----
  Retorna JSON com a quantidade de mensagens e notificações não lidas.

* **URL**

  /cliente/api/check-panel-status/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ id: (long) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ messageCount: (int), notificationCount: (int) }`


**contratar**
----
  Atualiza status do projeto para contratado e retorna JSON com o status atualizado.

* **URL**

  /cliente/api/contratar/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ id: (long), valorTotal: (double) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ status: (string) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 601, message: "O Valor Contratado difere do Orçamento atual" }` <br />
    **Content:** `{ error : 999, message: "Fail to load quotation" }`


**create-action**
----
  Cria actions com autenticação por APISecretKey.

* **URL**

  /cliente/api/create-action/

* **Method:**

  `POST`

*  **Data Params**

   `{ key: (string), actions: [ { action: (string), uri: (string), instalador: (string), cliente: (string), projeto: (string) } ] }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ error: 0, message: "" }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 400, message: "Parâmetros Inválidos" }`


**get-instalador**
----
  Retorna um JSON contendo os dados para mostrar na visualização do perfil do instalador

* **URL**

  /cliente/api/get-instalador/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ id: (long) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ email: (string), cnpj: (string), razao: (string), nome: (string), descricao: (string), image: (string), pontuacao: (double), elogioTransparencia: (boolean), elogioPontualidade: (boolean), elogioOrganizacao: (boolean), elogioConhecimento: (boolean), elogioAtendimento: (boolean), celular: (string), telefone: (string), status: (string) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load project" }`


**get-termo-uso**
----
  Retorna um JSON contendo os termos de uso para o aceite do Cliente.

* **URL**

  /cliente/api/get-termo-uso/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ termo: [string] }`

* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Missing setup data" }`


**is-action-valid**
----
  Verifica se a "action" ainda está válida.

* **URL**

  /cliente/api/is-action-valid/

* **Method:**

  `POST`

*  **Data Params**

   `{ id: (string), token: (string) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ status: (string) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Parâmetros inválidos" }`


**libera-projeto**
----
  Atualiza status do projeto para liberado e retorna JSON com o status atualizado.

* **URL**

  /cliente/api/libera-projeto/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ id: (long) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ status: (string) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load project" }`


**load-chat-list**
----
  Retorna JSON com a lista das últimas conversas.

* **URL**

  /cliente/api/load-chat-list/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

  `{ id: (long) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ chats: [ { id: (long), instalador: (string), sender: (string), ispending: (boolean), message: (string), createddate: (string) } ] }`


**load-notifications**
----
  Retorna JSON com a lista das últimas notificações não lidas.

* **URL**

  /cliente/api/load-notifications/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

  `{ id: (long) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ notifications: [ { id: (long), tipo: (string), orcamento: (string), instalador: (string), createddate: (string) } ] }`


**load-projeto-data**
----
  Retorna JSON contendo os dados do projeto.

* **URL**

  /cliente/api/load-projeto-data/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ id: (long) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ projeto: { id: (long), cnpj: (string), razao: (string), nome: (string), ramo: (string), logradouro: (string), numero: (string), complemento: (string), bairro: (string), cidade: (string), uf: (string), cep: (string), status: (string), gasContratado: (boolean), fotos: [ { id: (long), tipo: (string), imageURL: (string), motivo: (string), status: (string) } ], instaladores: [ { sfid: (string), nome: (string), image: (string), pontuacao: (double), orcamento: { valorServico: (double), valorMaterial: (double), desconto: (double), valorTotal: (double), materialIncluso: (boolean), servicos: [ { sfid: (string), descricao: (string), precoUnitario: (double), quantidade: (double), unidade: (string) } ], materiais: [ { sfid: (string), descricao: (string), categoria: (string), quantidade: (double), unidade: (string) } ] } } ], equipamentos: [ { tipo: (string), descricao: (string), quantidade: (double) } ] } }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load project" }`


**load-user-data**
----
  Retorna JSON contendo os dados do usuário Cliente, além dos dados resumidos dos projetos dos seus comércios.

* **URL**

  /cliente/api/load-user-data/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

  `{ complete: (boolean) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ email: (string), nome: (string), cpf: (string), celular: (string), telefone: (string), ativacao: (string), status: (string), projetos: [ { id: (long), cnpj: (string), razao: (string), nome: (string), ramo: (string), logradouro: (string), numero: (string), complemento: (string), bairro: (string), cidade: (string), uf: (string), cep: (string), status: (string) } ] }`

* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load user data" }`


**login**
----
  Verifica as credenciais do usuário Cliente e retorna JSON contendo os dados da sessão criada.

* **URL**

  /cliente/api/login/

* **Method:**

  `POST`

*  **Data Params**

   `{ email: (string), password: (string) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ error: 0, message: (string), clientId: (long), refreshToken: (string), sessionId: (string), accessToken: (string), ativacao: (string), status: (status) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 404, message: "Email ou Senha inválidos" }`


**logout**
----
  Encerra a sessão.

* **URL**

  /cliente/api/logout/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ error: 0, message: "" }`


**refresh-login**
----
  Efetua o refresh da sessão e retorna JSON contendo os dados da nova sessão criada.

* **URL**

  /cliente/api/refresh-login/

* **Method:**

  `POST`

*  **Data Params**

   `{ clientId: (string), password: (refreshToken) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ error: 0, message: (string), clientId: (long), refreshToken: (string), sessionId: (string), accessToken: (string), ativacao: (string), status: (status) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 591, message: "Login Inválido" }`


**reset-password**
----
  Conclui a criação de uma nova senha através de uma "action" enviada por email.

* **URL**

  /cliente/api/reset-password/

* **Method:**

  `POST`

*  **Data Params**

   `{ id: (string), token: (string), password: (string) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ error: 0, message: (string), clientId: (long), refreshToken: (string), sessionId: (string), accessToken: (string), ativacao: (string), status: (status) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Parâmetros inválidos" }`


**save-avaliacao-data**
----
  Registra a avaliacao do instalador feita pelo cliente. Retorna o status do projeto.

* **URL**

  /cliente/api/save-avaliacao-data/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ id: (long), pontuacao: (double), elogioTransparencia: (boolean), elogioPontualidade: (boolean), elogioOrganizacao: (boolean), elogioConhecimento: (boolean), elogioAtendimento: (boolean), reclamacaoDesorganizacao: (boolean), reclamacaoConhecimento: (boolean), reclamacaoAtraso: (boolean), reclamacaoAtendimento: (boolean) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ status: (string) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load project" }`


**save-projeto-equipamento**
----
  Atualiza a lista de equipamentos do estabelecimento que será base para o orçamento do instalador

* **URL**

  /cliente/api/save-projeto-equipamento/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ id: (long), equipamentos: [ { tipo: (string), quantidade: (double) } ] }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ equipamentos: [ { tipo: (string), descricao: (string), contratado: (string), informado: (string) } ], status: (string) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load project" }`


**send-password**
----
  Cria uma "action" para resetar a senha do cliente.

* **URL**

  /cliente/api/send-password/

* **Method:**

  `POST`

*  **Data Params**

   `{ email: (string) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ error: 0, message: "" }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 404, message: "E-mail não cadastrado!" }`


**send-receive-message**
----
  Salva as mensagens enviadas e retorna JSON com as novas mensagens recebidas.

* **URL**

  /cliente/api/send-receive-message/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ id: (long), lastMessageId: (long), firstMessageId: (long), messages: [ (string) ] }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ messages: [ { id: (long), sender: (string), message: (string), createddate: (string) } ] }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load quotation" }`


**set-notification-viewed**
----
  Salva as notificações como lidas e retorna JSON com as lista das notificações marcadas.

* **URL**

  /cliente/api/set-notification-viewed/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ id: (long), ids: [ (long) ], selectAll: (boolean) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ id: (long), ids: [ (long) ], visualizado: (boolean) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load quotation" }`

**set-obra-finalizada**
----
  Atualiza status do projeto para contratado e retorna JSON com o status atualizado.

* **URL**

  /cliente/api/set-obra-finalizada/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ id: (long) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ status: (string) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load project" }`


**solicita-ligacao**
----
  Atualiza status do projeto para contratado e retorna JSON com o status atualizado.

* **URL**

  /cliente/api/solicita-ligacao/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ id: (long), semana: (string), periodo: (string), comentario: (string) }` <br />
    semana => "Segunda;Terça;Quarta;Quinta;Sexta;Sábado" <br />
    periodo => "Manhã;Tarde"

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ status: (string) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load project" }`


**update-profile**
----
  Atualiza os dados do perfil do Instalador conforme o Estágio/Status de ativação.

* **URL**

  /cliente/api/update-profile/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ email: (string), cpf: (string), nome: (string), celular: (string), telefone: (string), aceitaTermo: (boolean), receberNotificacao: (boolean), ativacao: (string), status: (string) }`


* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ email: (string), cpf: (string), nome: (string), celular: (string), telefone: (string), notificacao: (boolean), ativacao: (string), status: (string) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load user data" }`


**upload-projeto-foto**
----
  Salva uma foto da obra enviada pelo cliente e cria um thumbnail 200x200px. Retorna JSON contendo todas as fotos + status do projeto.

* **URL**

  /cliente/api/upload-projeto-foto/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)` <br />
  `Data-id: (string)` <br />
  `Data-tipo: (string)` <br />
  `Data-foto-id: (string)`

*  **Data Params**

   JPEG Image raw data in Base64

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ fotos: [ { id: (long), tipo: (string), imageURL: (string), motivo: (string), status: (string) } ], status: (string) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Invalid Parameters" }`
