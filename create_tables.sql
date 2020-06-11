-- ****************************************
-- * Intalador - index (email__c)
-- ***


-- DROP INDEX salesforce.instalefacil_instalador__c_email__c;

-- CREATE INDEX instalefacil_instalador__c_email__c
--   ON salesforce.instalefacil_instalador__c USING btree
--   (email__c)
--   TABLESPACE pg_default;


-- ****************************************
-- * Instalador Session
-- ***

CREATE SEQUENCE salesforce.instalefacil_instalador_session_id_seq INCREMENT BY 1;

CREATE TABLE salesforce.instalefacil_instalador_session
(
   id integer NOT NULL DEFAULT nextval('salesforce.instalefacil_instalador_session_id_seq'::regclass),
   token character varying(32) COLLATE pg_catalog."default",
   userid integer NOT NULL DEFAULT 0,
   lastusestamp integer NOT NULL DEFAULT 0,
   createddate timestamp without time zone,
   status character varying(1) COLLATE pg_catalog."default",
   CONSTRAINT instalefacil_instalador_session_pkey PRIMARY KEY (id)
)
WITH (
   OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE salesforce.instalefacil_instalador_session
   OWNER to gzfiegfrvlimkr;

-- Index: instalefacil_instalador_session_userid

-- DROP INDEX salesforce.instalefacil_instalador_session_userid;

CREATE INDEX instalefacil_instalador_session_userid
   ON salesforce.instalefacil_instalador_session USING btree
   (userid)
   TABLESPACE pg_default;

-- Index: instalefacil_instalador_session_lastusestamp

-- DROP INDEX salesforce.instalefacil_instalador_session_lastusestamp;

CREATE INDEX instalefacil_instalador_session_lastusestamp
   ON salesforce.instalefacil_instalador_session USING btree
   (lastusestamp)
   TABLESPACE pg_default;

-- ****************************************
-- * Instalador Login
-- ***

CREATE SEQUENCE salesforce.instalefacil_instalador_login_id_seq INCREMENT BY 1;

CREATE TABLE salesforce.instalefacil_instalador_login
(
   id integer NOT NULL DEFAULT nextval('salesforce.instalefacil_instalador_login_id_seq'::regclass),
   token character varying(32) COLLATE pg_catalog."default",
   userid integer NOT NULL DEFAULT 0,
   lastusestamp integer NOT NULL DEFAULT 0,
   createddate timestamp without time zone,
   status character varying(1) COLLATE pg_catalog."default",
   CONSTRAINT instalefacil_instalador_login_pkey PRIMARY KEY (id)
)
WITH (
   OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE salesforce.instalefacil_instalador_login
   OWNER to gzfiegfrvlimkr;

-- Index: instalefacil_instalador_login_userid

-- DROP INDEX salesforce.instalefacil_instalador_login_userid;

CREATE INDEX instalefacil_instalador_login_userid
   ON salesforce.instalefacil_instalador_login USING btree
   (userid)
   TABLESPACE pg_default;

-- Index: instalefacil_instalador_login_lastusestamp

-- DROP INDEX salesforce.instalefacil_instalador_login_lastusestamp;

CREATE INDEX instalefacil_instalador_login_lastusestamp
   ON salesforce.instalefacil_instalador_login USING btree
   (lastusestamp)
   TABLESPACE pg_default;


-- ****************************************
-- * Cliente Session
-- ***

CREATE SEQUENCE salesforce.instalefacil_cliente_session_id_seq INCREMENT BY 1;

CREATE TABLE salesforce.instalefacil_cliente_session
(
   id integer NOT NULL DEFAULT nextval('salesforce.instalefacil_cliente_session_id_seq'::regclass),
   token character varying(32) COLLATE pg_catalog."default",
   userid integer NOT NULL DEFAULT 0,
   lastusestamp integer NOT NULL DEFAULT 0,
   createddate timestamp without time zone,
   status character varying(1) COLLATE pg_catalog."default",
   CONSTRAINT instalefacil_cliente_session_pkey PRIMARY KEY (id)
)
WITH (
   OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE salesforce.instalefacil_cliente_session
   OWNER to gzfiegfrvlimkr;

-- Index: instalefacil_cliente_session_userid

-- DROP INDEX salesforce.instalefacil_cliente_session_userid;

CREATE INDEX instalefacil_cliente_session_userid
   ON salesforce.instalefacil_cliente_session USING btree
   (userid)
   TABLESPACE pg_default;

-- Index: instalefacil_cliente_session_lastusestamp

-- DROP INDEX salesforce.instalefacil_cliente_session_lastusestamp;

CREATE INDEX instalefacil_cliente_session_lastusestamp
   ON salesforce.instalefacil_cliente_session USING btree
   (lastusestamp)
   TABLESPACE pg_default;


-- ****************************************
-- * Cliente Login
-- ***

CREATE SEQUENCE salesforce.instalefacil_cliente_login_id_seq INCREMENT BY 1;

CREATE TABLE salesforce.instalefacil_cliente_login
(
   id integer NOT NULL DEFAULT nextval('salesforce.instalefacil_cliente_login_id_seq'::regclass),
   token character varying(32) COLLATE pg_catalog."default",
   userid integer NOT NULL DEFAULT 0,
   lastusestamp integer NOT NULL DEFAULT 0,
   createddate timestamp without time zone,
   status character varying(1) COLLATE pg_catalog."default",
   CONSTRAINT instalefacil_cliente_login_pkey PRIMARY KEY (id)
)
WITH (
   OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE salesforce.instalefacil_cliente_login
   OWNER to gzfiegfrvlimkr;

-- Index: instalefacil_cliente_login_userid

-- DROP INDEX salesforce.instalefacil_cliente_login_userid;

CREATE INDEX instalefacil_cliente_login_userid
   ON salesforce.instalefacil_cliente_login USING btree
   (userid)
   TABLESPACE pg_default;

-- Index: instalefacil_cliente_login_lastusestamp

-- DROP INDEX salesforce.instalefacil_cliente_login_lastusestamp;

CREATE INDEX instalefacil_cliente_login_lastusestamp
   ON salesforce.instalefacil_cliente_login USING btree
   (lastusestamp)
   TABLESPACE pg_default;


-- ****************************************
-- * Messenger
-- ***

CREATE SEQUENCE salesforce.instalefacil_messenger_id_seq INCREMENT BY 1;

CREATE TABLE salesforce.instalefacil_messenger
(
   id integer NOT NULL DEFAULT nextval('salesforce.instalefacil_messenger_id_seq'::regclass),
   orcamento_id integer NOT NULL DEFAULT 0,
   sender character varying(1) COLLATE pg_catalog."default",
   ispending boolean NOT NULL DEFAULT true,
   message character varying(100000) COLLATE pg_catalog."default",
   createddate timestamp without time zone,
   CONSTRAINT instalefacil_messenger_pkey PRIMARY KEY (id)
)
WITH (
   OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE salesforce.instalefacil_messenger
   OWNER to gzfiegfrvlimkr;

-- Index: instalefacil_messenger_orcamento

-- DROP INDEX salesforce.instalefacil_messenger_orcamento;

CREATE INDEX instalefacil_messenger_orcamento
   ON salesforce.instalefacil_messenger USING btree
   (orcamento_id,id)
   TABLESPACE pg_default;


-- ****************************************
-- * Metadata - Picklist Table
-- ***

CREATE TABLE salesforce.instalefacil_picklist_table
(
   fieldname character varying(80) COLLATE pg_catalog."default",
   apiname character varying(255) COLLATE pg_catalog."default",
   label character varying(255) COLLATE pg_catalog."default",
   isdeleted boolean,
   CONSTRAINT instalefacil_picklist_table_pkey PRIMARY KEY (fieldname,apiname)
)
WITH (
   OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE salesforce.instalefacil_picklist_table
   OWNER to gzfiegfrvlimkr;

INSERT INTO salesforce.instalefacil_picklist_table (fieldname, apiname, label, isdeleted) VALUES
('Equipamento','Aquecedor','Aquecedor',false),
('Equipamento','Autoclave','Autoclave',false),
('Equipamento','Banho','Banho',false),
('Equipamento','Bico de bunsen','Bico de bunsen',false),
('Equipamento','Boca','Boca',false),
('Equipamento','Buffet','Buffet',false),
('Equipamento','Cabine','Cabine',false),
('Equipamento','Calandra','Calandra',false),
('Equipamento','Caldeira','Caldeira',false),
('Equipamento','Chapa','Chapa',false),
('Equipamento','Char broiler','Char broiler',false),
('Equipamento','Churrasqueira','Churrasqueira',false),
('Equipamento','Climatização','Climatização',false),
('Equipamento','Cogeração','Cogeração',false),
('Equipamento','Cozedor de massas','Cozedor de massas',false),
('Equipamento','Fogão','Fogão',false),
('Equipamento','Forno','Forno',false),
('Equipamento','Frangueira','Frangueira',false),
('Equipamento','Fritadeira','Fritadeira',false),
('Equipamento','Gerador','Gerador',false),
('Equipamento','Grelhador','Grelhador',false),
('Equipamento','Lareira','Lareira',false),
('Equipamento','Marmiteiro','Marmiteiro',false),
('Equipamento','MDO','MDO',false),
('Equipamento','Outros','Outros',false),
('Equipamento','Panela','Panela',false),
('Equipamento','Queimador','Queimador',false),
('Equipamento','Salamandra','Salamandra',false),
('Equipamento','Secadora','Secadora',false),
('Equipamento','Tacho','Tacho',false);

INSERT INTO salesforce.instalefacil_picklist_table (fieldname, apiname, label, isdeleted) VALUES
('Ramo_Atividade','ACADEMIAS','Academias',false),
('Ramo_Atividade','ASILO','Asilo',false),
('Ramo_Atividade','ASSOCIAÇÕES E ENTIDADES','Associações e entidades',false),
('Ramo_Atividade','ATIVIDADES ESPORTIVAS','Atividades esportivas',false),
('Ramo_Atividade','AUTOMOTIVO / PNEUMATICO','Automotivo / pneumatico',false),
('Ramo_Atividade','BARES','Bares',false),
('Ramo_Atividade','CABELEIREIROS','Cabeleireiros',false),
('Ramo_Atividade','CALL CENTER','Call center',false),
('Ramo_Atividade','CANTEIRO','Canteiro',false),
('Ramo_Atividade','CASA DE SAUDE','Casa de saude',false),
('Ramo_Atividade','CENTRO COMERCIAL','Centro comercial',false),
('Ramo_Atividade','CENTRO DE DISTRIBUIÇÃO','Centro de distribuição',false),
('Ramo_Atividade','CENTRO DE EVENTOS','Centro de eventos',false),
('Ramo_Atividade','CERAMICA','Ceramica',false),
('Ramo_Atividade','CHURRASCARIA','Churrascaria',false),
('Ramo_Atividade','CLINICA MEDICA','Clinica medica',false),
('Ramo_Atividade','CLÍNICAS','Clinicas',false),
('Ramo_Atividade','CLUBE','Clube',false),
('Ramo_Atividade','CLUBES','Clubes',false),
('Ramo_Atividade','COMERCIO VAREJISTA - LOJAS','Comercio varejista - lojas',false),
('Ramo_Atividade','CONDOMINIOS PREDIAIS','Condominios Prediais',false),
('Ramo_Atividade','COZINHA INDUSTRIAL','Cozinha industrial',false),
('Ramo_Atividade','CREMATORIOS','Crematorios',false),
('Ramo_Atividade','DATACENTER','Datacenter',false),
('Ramo_Atividade','DEMAIS (ALIMENTAÇÃO)','Demais (alimentação)',false),
('Ramo_Atividade','DEMAIS CNAE''S','Demais CNAE''S',false),
('Ramo_Atividade','EDUCACAO','Educação',false),
('Ramo_Atividade','ELETRO / ELETRONICO','Eletro / Eletronico',false),
('Ramo_Atividade','ENTRETENIMENTO','Entretenimento',false),
('Ramo_Atividade','ESCOLAS','Escolas',false),
('Ramo_Atividade','ESCRITORIO','Escritorio',false),
('Ramo_Atividade','FABRICAÇÃO DE ALIMENTOS','Fabricação de alimentos',false),
('Ramo_Atividade','FARMACEUTICO','Farmaceutico',false),
('Ramo_Atividade','GASTRONOMIA','Gastronomia',false),
('Ramo_Atividade','GER. AGUA QUENTE','GER - agua quente',false),
('Ramo_Atividade','GNC - AUTOMOTIVO','GNC - automotivo',false),
('Ramo_Atividade','GNL - AUTOMOTIVO','GNL - automotivo',false),
('Ramo_Atividade','HIPERMERCADOS','Hipermercados',false),
('Ramo_Atividade','HOSPITAIS','Hospitais',false),
('Ramo_Atividade','HOSPITAL','Hospital',false),
('Ramo_Atividade','HOTÉIS','Hotéis',false),
('Ramo_Atividade','HOTEL','Hotel',false),
('Ramo_Atividade','INDÚSTRIA','Indústria',false),
('Ramo_Atividade','INDÚSTRIA GRÁFICA','Indústria gráfica',false),
('Ramo_Atividade','LANCHONETES','Lanchonetes',false),
('Ramo_Atividade','LAVANDEIRIAS','Lavanderias',false),
('Ramo_Atividade','MERCADO','Mercado',false),
('Ramo_Atividade','MISTO','Misto',false),
('Ramo_Atividade','MÓTEIS','MÓTEIS',false),
('Ramo_Atividade','MOTEL','Motel',false),
('Ramo_Atividade','MUSEU','Museu',false),
('Ramo_Atividade','OFICINA','Oficina',false),
('Ramo_Atividade','ÓRGÃOS PÚBLICOS','Órgãos Públicos',false),
('Ramo_Atividade','OUTROS','Outros',false),
('Ramo_Atividade','PADARIAS','Padarias',false),
('Ramo_Atividade','PANIFICADORA','Panificadora',false),
('Ramo_Atividade','PISCINA','Piscina',false),
('Ramo_Atividade','PIZZARIA','Pizzaria',false),
('Ramo_Atividade','PIZZARIAS','Pizzarias',false),
('Ramo_Atividade','POSTO','Posto',false),
('Ramo_Atividade','PRÉDIO COMERCIAL','Prédio comercial',false),
('Ramo_Atividade','PROFISSIONAL LIBERAL','Profissional liberal',false),
('Ramo_Atividade','PRONTO SOCORRO','Pronto socorro',false),
('Ramo_Atividade','QUIMICO / PETROQUIMICO','Quimico / petroquimico',false),
('Ramo_Atividade','RESTAURANTES','Restaurantes',false),
('Ramo_Atividade','SANEAMENTO','Saneamento',false),
('Ramo_Atividade','SAUDE','Saude',false),
('Ramo_Atividade','SHOPPINGS','Shoppings',false),
('Ramo_Atividade','SPA','SPA',false),
('Ramo_Atividade','SUPERMERCADOS','Supermercados',false),
('Ramo_Atividade','TEATRO','Teatro',false),
('Ramo_Atividade','TEXTIL / LAVANDEIRIA / TINTURA','Textil / lavanderia / tintura',false);


INSERT INTO salesforce.instalefacil_picklist_table (fieldname, apiname, label, isdeleted) VALUES
('OpcaoRejeicao','Fora da área de atuação','Fora da área de atuação',false),
('OpcaoRejeicao','Férias','Férias',false),
('OpcaoRejeicao','Não quero mais ser Instalador','Não quero mais ser Instalador',false),
('OpcaoRejeicao','Muitas obras','Muitas obras',false);
