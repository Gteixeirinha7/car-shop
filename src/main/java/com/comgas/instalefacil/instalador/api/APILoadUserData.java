package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.core.AppUtils;
import com.comgas.instalefacil.instalador.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/load-user-data")
public class APILoadUserData extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        long userId = this.getUserId();

        ResultSet rs = this.executeQuery(
            "SELECT id, sfid, email__c, cnpj__c, razao_social__c,"+
            " name, descricao_empresa__c, celular__c, telefone__c,"+
            " cep__c, status_ativacao__c, status__c,"+
            " receber_pedidos__c, imageurl__c, pontuacao_media__c"+
            " FROM salesforce.instalefacil_instalador__c"+
            " WHERE id = "+userId+
            " AND isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load user data", "APILoadUserData.execute");
        }

        String nome = rs.getString("name");
        String sfid = rs.getString("sfid");
        if (nome != null && sfid != null
                && nome.length() > 14 && sfid.length() > 14
                    && nome.substring(0,15).equals(sfid.substring(0,15)))
        {
            nome = null;
        }

        JSONObject returnData = new JSONObject();
        returnData.put("email",     rs.getString("email__c"));
        returnData.put("cnpj",      rs.getString("cnpj__c"));
        returnData.put("razao",     rs.getString("razao_social__c"));
        returnData.put("nome",      nome);
        returnData.put("celular",   rs.getString("celular__c"));
        returnData.put("telefone",  rs.getString("telefone__c"));
        returnData.put("cep",       rs.getString("cep__c"));
        returnData.put("descricao", rs.getString("descricao_empresa__c"));
        returnData.put("image",     rs.getString("imageurl__c"));
        returnData.put("pontuacao", rs.getDouble("pontuacao_media__c"));
        returnData.put("ativacao",  rs.getString("status_ativacao__c"));
        returnData.put("receberPedidos",rs.getBoolean("receber_pedidos__c"));
        returnData.put("status",    rs.getString("status__c"));


        Boolean complete = (inputData.containsKey("complete") ?
                Boolean.valueOf(inputData.get("complete").toString()) : false);

        if (complete){
            JSONArray projetos = new JSONArray();
            HashMap<String,Integer> projetoMap = new HashMap<>();
            rs = this.executeQuery(
                "SELECT A.id AS orcamentoId, A.status__c AS orcamentoStatus,"+
                    " A.valor_servico__c, A.valor_material__c,"+
                    " A.desconto__c, A.material_incluso__c,"+
                    " B.id AS projetoId, B.sfid AS projetoSFId,"+
                    " B.status__c AS projetoStatus,"+
                    " B.instalador_enviafotos__c, B.contrato__c, B.contrato_externo__c,"+
                    " B.razao_social__c, B1.label AS ramo_atividade,"+
                    " B.logradouro__c, B.complemento__c, B.numero__c,"+
                    " B.bairro__c, B.cidade__c, B.status__c AS projetoStatus,"+
                    " C.name, C.telefone__c, C.celular__c "+
                " FROM salesforce.instalefacil_orcamento__c A"+
                    ", salesforce.instalefacil_projeto__c B"+
                        " LEFT JOIN salesforce.instalefacil_picklist_table B1"+
                        " ON B1.fieldname = 'Ramo_Atividade'"+
                        " AND B1.apiname = B.ramo_atividade__c"+
                    ", salesforce.instalefacil_cliente__c C"+
                " WHERE A.instalador__c = '"+this.getUserSFId()+"'"+
                " AND (A.status__c > '0A' OR B.status__c < '3A')"+
                //" AND A.status__c <> '9D'"+
                " AND A.status__c <> '9X'"+
                " AND A.isdeleted = false"+
                " AND B.sfid = A.projeto__c"+
                " AND B.isdeleted = false"+
                " AND C.sfid = B.cliente__c"+
                " AND C.isdeleted = false"+
                " ORDER BY A.systemmodstamp DESC"
            );
            while(rs.next()){
                Boolean instaladorEnviaFotos = rs.getBoolean("instalador_enviafotos__c");
                if (instaladorEnviaFotos){
                    instaladorEnviaFotos = (
                        rs.getBoolean("contrato_externo__c")
                            || (rs.getString("contrato__c") != null
                                    && rs.getString("contrato__c").compareTo(" ") > 0)
                    );
                }
                projetoMap.put(rs.getString("projetoSFId"),projetos.size());
                JSONObject orcamento = new JSONObject();
                orcamento.put("id", rs.getLong("orcamentoId"));
                orcamento.put("valorServico", rs.getDouble("valor_servico__c"));
                orcamento.put("valorMaterial", rs.getDouble("valor_material__c"));
                orcamento.put("desconto", rs.getDouble("desconto__c"));
                orcamento.put("materialIncluso", rs.getBoolean("material_incluso__c"));
                orcamento.put("status", rs.getString("orcamentoStatus"));
                JSONObject contato = new JSONObject();
                contato.put("nome", rs.getString("name"));
                contato.put("celular", rs.getString("celular__c"));
                contato.put("telefone", rs.getString("telefone__c"));
                JSONObject projeto = new JSONObject();
                projeto.put("id", rs.getLong("projetoId"));
                projeto.put("razao", rs.getString("razao_social__c"));
                projeto.put("ramo", rs.getString("ramo_atividade"));
                projeto.put("logradouro", rs.getString("logradouro__c"));
                projeto.put("numero", rs.getString("numero__c"));
                projeto.put("complemento", rs.getString("complemento__c"));
                projeto.put("bairro", rs.getString("bairro__c"));
                projeto.put("cidade", rs.getString("cidade__c"));
                projeto.put("status", rs.getString("projetoStatus"));
                projeto.put("enviaFotos", instaladorEnviaFotos);
                projeto.put("contato", contato);
                projeto.put("orcamento", orcamento);
                projeto.put("equipamentos", new JSONArray());
                projetos.add(projeto);
            }
            if (projetoMap.size() > 0){
                rs = this.executeQuery(
                    "SELECT A.projeto__c, B.label, A.quantidade_informada__c"+
                    " FROM salesforce.instalefacil_projeto_equipamento__c A"+
                        ", salesforce.instalefacil_picklist_table B"+
                    " WHERE A.projeto__c IN ('"+AppUtils.implode("','",projetoMap.keySet())+"')"+
                    " AND A.quantidade_informada__c > 0"+
                    " AND A.isdeleted = false"+
                    " AND B.fieldname = 'Equipamento'"+
                    " AND B.apiname = A.equipamento__c"+
                    " ORDER BY A.projeto__c ASC, B.label ASC"
                );
                while(rs.next()){
                    String projetoSFId = rs.getString("projeto__c");
                    if (projetoMap.containsKey(projetoSFId)){
                        JSONArray equipamentos = (JSONArray)
                            ((JSONObject) projetos.get(
                                    projetoMap.get(projetoSFId))
                                ).get("equipamentos");
                        JSONObject equipamento = new JSONObject();
                        equipamento.put("descricao", rs.getString("label"));
                        equipamento.put("quantidade",rs.getDouble("quantidade_informada__c"));
                        equipamentos.add(equipamento);
                    }
                }
            }
            returnData.put("projetos", projetos);
        }
        return returnData;
    }

}
