*Documentação API System*
----

**load-messages**
----
  Retorna JSON com as mensagens trocadas entre Instalador e Cliente.

* **URL**

  /system/api/load-messages/

* **Method:**

  `POST`

*  **Data Params**

   `{ key: (string), orcamento: (string) }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ messages: [ { sender: (string), message: (string), createddate: (string) } ] }`


* **Error Response:**

  * **Code:** 200 <br />
    **Content:** `{ error : 999, message: "Fail to load quotation" }`
