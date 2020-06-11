*Documentação API Instalador*
----

**change-password**
----
  Altera a senha do Instalador.

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

  /instalador/api/check-new-messages/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ messageCount: (int) }`


**check-new-notifications**
----
  Retorna JSON com a quantidade de notificações não lidas.

* **URL**

  /instalador/api/check-new-notifications/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ notificationCount: (int) }`


**check-panel-status**
----
  Retorna JSON com a quantidade de mensagens e notificações não lidas.

* **URL**

  /instalador/api/check-panel-status/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ messageCount: (int), notificationCount: (int) }`


**create-action**
----
  Cria actions com autenticação por APISecretKey.

* **URL**

  /instalador/api/create-action/

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


**emailchecked**
----
  Confirma que o email existe e atualiza o status de cadastro. Retorna JSON  contendo os dados da sessão criada.

* **URL**

  /instalador/api/emailchecked/

* **Method:**

  `POST`

*  **Data Params**

   `{ id: (string), token: (string) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ error: 0, message: (string), clientId: (long), refreshToken: (string), sessionId: (string), accessToken: (string), ativacao: (string), status: (status) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Parâmetros inválidos" }`


**get-region-list**
----
  Retorna um JSON contendo a lista de areas e regiões de atuação do Instalador.

* **URL**

  /instalador/api/get-region-list/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ areas: [ { nome: (string), regioes: [ (string) ], selected: (boolean) } ] }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Missing setup data" }`


**get-termo-uso**
----
  Retorna um JSON contendo os termos de uso para o aceite do Instalador.

* **URL**

  /instalador/api/get-termo-uso/

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

  /instalador/api/is-action-valid/

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


**load-chat-list**
----
  Retorna JSON com a lista das últimas conversas.

* **URL**

  /instalador/api/load-chat-list/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ chats: [ { id: (long), cliente: (long), comercio: (string), sender: (string), ispending: (boolean), message: (string), createddate: (string) } ] }`


**load-notifications**
----
  Retorna JSON com a lista das últimas notificações não lidas.

* **URL**

  /instalador/api/load-notifications/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ notifications: [ { id: (long), tipo: (string), orcamento: (string), razao: (string), createddate: (string) } ] }`


**load-orcamento-data**
----
  Retorna JSON contendo os dados do orçamento.

* **URL**

  /instalador/api/load-orcamento-data/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

  `{ id: (long) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ id: (string), valorServico: (double), valorMaterial: (double), desconto: (double), valorTotal: (double), materialIncluso: (boolean), status: (string), servicos: [ sfid: (string), descricao: (string), precoUnitario: (double), quantidade: (long) ], materiais: [ sfid: (string), descricao: (string), quantidade: (long) ] }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load quotation" }`


**load-projeto-foto-data**
----
  Retorna JSON com a lista de fotos do projeto.

* **URL**

  /instalador/api/load-projeto-foto-data/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

  `{ id: (long) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ fotos: [ { id: (long), tipo: (string), imageURL: (string), motivo: (string), status: (string) } ], enviaFotos: (boolean) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load project" }`


**load-qualificacao-data**
----
  Retorna JSON com os modulos de avaliaçao inicial do instalador.

* **URL**

  /instalador/api/load-qualificacao-data/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ avaliacao: (double), modulos: [ { id: (long), tipo: (string), descricao: (string), image: (string), video: (string), finalizado: (boolean), pontuacao: (boolean), perguntas: [ { pergunta: (string), alternativa1: (string), alternativa2: (string), alternativa3: (string), alternativa4: (string), alternativa5: (string) } ] } ] }`


**load-projeto-foto-data**
----
  Retorna JSON com a lista de fotos do projeto.

* **URL**

  /instalador/api/load-projeto-foto-data/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

  `{ id: (long) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ fotos: [ { id: (long), tipo: (string), imageURL: (string), motivo: (string), status: (string) } ], enviaFotos: (boolean) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load project" }`


**load-qualificacao-data**
----
  Retorna JSON com os modulos de avaliaçao inicial do instalador.

* **URL**

  /instalador/api/load-qualificacao-data/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ avaliacao: (double), modulos: [ { id: (long), tipo: (string), descricao: (string), image: (string), video: (string), finalizado: (boolean), pontuacao: (boolean), perguntas: [ { pergunta: (string), alternativa1: (string), alternativa2: (string), alternativa3: (string), alternativa4: (string), alternativa5: (string) } ] } ] }`


**load-user-data**
----
  Retorna JSON contendo os dados usuário Instalador, além dos dados resumidos dos projetos que o instalador está participando.

* **URL**

  /instalador/api/load-user-data/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

  `{ complete: (boolean) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ image: (string), telefone: (string), projetos: (), nome: (string), cnpj: (string), razao: (string), ativacao: (string), cep: (string), descricao: (string), pontuacao: (double), receberPedidos: (boolean), celular: (string), email: (string), status: (string), projetos: [ { id: (long), cnpj: (string), razao: (string), nome: (string), ramo: (string), logradouro: (string), numero: (string), complemento: (string), bairro: (string), cidade: (string), uf: (string), cep: (string), status: (string) } ] }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load user data" }`


**login**
----
  Verifica as credenciais do usuário e retorna JSON contendo os dados da sessão criada.

* **URL**

  /instalador/api/login/

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

  /instalador/api/logout/

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


**refazer-qualificacao**
----
  Modifica o status da avaliação inicial do Instalador para "Refazer" e Retorna JSON com a pontuação da última avaliação.

* **URL**

  /instalador/api/refazer-qualificacao/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ avaliacao: (double), ativacao: (string), status: (string) }`


**refresh-login**
----
  Efetua o refresh da sessão e retorna JSON contendo os dados da nova sessão criada.

* **URL**

  /instalador/api/refresh-login/

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

  /instalador/api/reset-password/

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


**save-orcamento-data**
----
  Salva o orçamento, atualiza o status e retorna JSON contento os dados do orçamento

* **URL**

  /instalador/api/save-orcamento-data/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ id: (long), valorServico: (double), valorMaterial: (double), desconto: (double), valorTotal: (double), materialIncluso: (boolean), materiais: [ { sfid: (string), descricao: (string), quantidade: (double) } ], servicos: [ { sfid: (string), descricao: (string), precoUnitario: (double), quantidade: (double) } ] }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ orcamento: { id: (long), valorServico: (double), valorMaterial: (double), desconto: (double), valorTotal: (double), materialIncluso: (boolean), status: (string), materiais: [ { sfid: (string), descricao: (string), quantidade: (double) } ], servicos: [ { sfid: (string), descricao: (string), precoUnitario: (double), quantidade: (double) } ] } }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 602, message: "Orcamento bloqueado para alteração" }` <br />
    **Content:** `{ error : 999, message: "Fail to load quotation" }`


**save-qualificacao-data**
----
  Verifica as respostas das perguntas do módulo, calcula a pontuação e retorna o JSON com o status atualizado.

* **URL**

  /instalador/api/save-qualificacao-data/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ avaliacao: (string), modulo: (string), respostas: [ (string) ] }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ avaliacao: (string), modulo: (string), finalizado: (boolean), pontuacaoInicial: (double), ativacao: (string), status: (string) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load user data" }`


**send-email-check**
----
  Cria uma "action" para validar o email do instalador.

* **URL**

  /instalador/api/send-email-check/

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


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Parâmetros inválidos" }`


**send-password**
----
  Cria uma "action" para resetar a senha do instalador.

* **URL**

  /instalador/api/send-password/

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

  /instalador/api/send-receive-message/

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

  /instalador/api/set-notification-viewed/

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


**set-area-atuacao**
----
  Salva as areas de atuação do Instalador e retorna JSON com os dados da area de atuação + status de ativação.

* **URL**

  /instalador/api/set-area-atuacao/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ areas: [ (string) ] }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ regioes: [ { id: (string), name: (string), area: (string) } ], ativacao: (string), status: (string) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load user data" }`


**set-obra-finalizada**
----
  Atualiza status do projeto para obra finalizada e retorna JSON com o status atualizado.

* **URL**

  /instalador/api/set-obra-finalizada/

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


**set-orcamento-status**
----
  Atualiza status do orçamento para Aceito/Rejeitado/Orçado e retorna JSON com o status atualizado.

* **URL**

  /instalador/api/set-orcamento-status/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ id: (long), status: (string), motivo: (string), opcaoRejeicao: (string) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ status: (string) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load quotation" }`


**signin**
----
  Cria um novo usuário de Instalador e retorna um JSON contendo os dados da sessão criada.

* **URL**

  /instalador/api/signin/

* **Method:**

  `POST`

*  **Data Params**

   `{ email: [string], password: [string] }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ error: 0, message: [string], clientId: [long], refreshToken: [string], sessionId: [string], accessToken: [string], ativacao: [string], status: [status] }`

* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 401, message: "Email já está Cadastrado" }`


**update-profile**
----
  Atualiza os dados do perfil do Instalador conforme o Estágio/Status de ativação.

* **URL**

  /instalador/api/update-profile/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   `{ cnpj: (string), razao: (string), nome: (string), telefone: (string), celular: (string), cep: (string), descricao: (string), receberPedidos: (boolean), aceitaTermo: (boolean) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ cnpj: (string), razao: (string), nome: (string), telefone: (string), celular: (string), cep: (string), descricao: (string), receberPedidos: (boolean) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load user data" }`


**upload-profile-foto**
----
  Salva a foto do perfil do Instalador e cria um thumbnail 200x200px. Retorna JSON com URL da imagem + status do cadastro.

* **URL**

  /instalador/api/upload-profile-foto/

* **Method:**

  `POST`

*  **Headers**

  `Session-id: (string)` <br />
  `Access-token: (string)`

*  **Data Params**

   JPEG Image raw data in Base64

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ imageURL: (string), status: (string) }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Invalid Data" }`


**upload-projeto-foto**
----
  Salva uma foto da obra enviada pelo instalador e cria um thumbnail 200x200px. Retorna JSON contendo todas as fotos + status do projeto.

* **URL**

  /instalador/api/upload-projeto-foto/

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
