package com.comgas.instalefacil.cliente.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.cliente.APIHandler;
import com.comgas.instalefacil.core.AppUtils;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/cliente/api/load-projeto-data")
public class APILoadProjetoData extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {
        
        if (!inputData.containsKey("id")){
            throw new AppException("Invalid Parameters", "APILoadProjetoData.execute");
        }
        Long id = Long.valueOf(inputData.get("id").toString());
        ResultSet rs = this.executeQuery(
            "SELECT A.id, A.sfid, A.numero__c, A.cnpj__c,"+
                " A.razao_social__c, A.contrato__c, A.contrato_externo__c,"+
                " A.ramo_atividade__c, A.name, A.logradouro__c,"+
                " A.complemento__c, A.bairro__c, A.cidade__c,"+
                " A.estado__c, A.cep__c, A.status__c"+
            " FROM salesforce.instalefacil_projeto__c A"+
            " WHERE A.id = "+id+
            " AND A.cliente__c = '"+this.escape(this.getUserSFId())+"'"+
            " AND A.status__c > '0A'"+
            " AND A.isdeleted = false"+
            " ORDER BY A.systemmodstamp DESC"
        );
        if(!rs.next()){
            throw new AppException("Fail to load project", "APILoadProjetoData.execute");
        }
        Boolean gasContratado = (
            rs.getBoolean("contrato_externo__c")
                || (rs.getString("contrato__c") != null
                        && rs.getString("contrato__c").compareTo(" ") > 0)
        );
        JSONObject projeto = new JSONObject();
        projeto.put("id",       rs.getLong("id"));
        projeto.put("cnpj",     rs.getString("cnpj__c"));
        projeto.put("razao",    rs.getString("razao_social__c"));
        projeto.put("nome",     rs.getString("name"));
        projeto.put("ramo",     rs.getString("ramo_atividade__c"));
        projeto.put("logradouro",rs.getString("logradouro__c"));
        projeto.put("numero",   rs.getString("numero__c"));
        projeto.put("complemento",rs.getString("complemento__c"));
        projeto.put("bairro",   rs.getString("bairro__c"));
        projeto.put("cidade",   rs.getString("cidade__c"));
        projeto.put("uf",       rs.getString("estado__c"));
        projeto.put("cep",      rs.getString("cep__c"));
        projeto.put("status",   rs.getString("status__c"));
        projeto.put("gasContratado", gasContratado);

        String projetoSFId = rs.getString("sfid");

        JSONArray instaladores = new JSONArray();
        JSONArray equipamentos = new JSONArray();
        JSONArray fotos = new JSONArray();
        
        HashMap<String,Integer> orcamentoMap = new HashMap<>();
        
        rs = this.executeQuery(
            "SELECT A.id, A.sfid, A.instalador__c, A.valor_servico__c,"+
                    " A.valor_material__c, A.desconto__c,"+
                    " A.material_incluso__c, A.status__c,"+
                    " B.name, B.imageurl__c, B.pontuacao_media__c"+
               " FROM salesforce.instalefacil_orcamento__c A"+
                   ", salesforce.instalefacil_instalador__c B"+
               " WHERE A.projeto__c = '"+this.escape(projetoSFId)+"'"+
               " AND A.cliente__c = '"+this.getUserSFId()+"'"+ 
               " AND A.status__c > '0A'"+
               " AND A.status__c <> '9D'"+
               " AND A.isdeleted = false"+
               " AND B.sfid = A.instalador__c"+
               " AND B.isdeleted = false"+
               " ORDER BY B.pontuacao_media__c DESC"
        );
        while(rs.next()){
            JSONObject instalador = new JSONObject();
            instalador.put("sfid",  rs.getString("instalador__c"));
            instalador.put("nome",  rs.getString("name"));
            instalador.put("image", rs.getString("imageurl__c"));
            instalador.put("pontuacao", rs.getDouble("pontuacao_media__c"));
            String orcamentoStatus = rs.getString("status__c");
            if (orcamentoStatus.compareTo("1A") >= 0){
                instalador.put("orcamento", rs.getLong("id"));
                if (orcamentoStatus.compareTo("2A") >= 0){
                    Double valorServico = rs.getDouble("valor_servico__c");
                    Double valorMaterial = rs.getDouble("valor_material__c");
                    Double desconto = rs.getDouble("desconto__c");
                    Boolean materialIncluso = rs.getBoolean("material_incluso__c");
                    Double valorTotal = (valorServico + (materialIncluso ? valorMaterial : 0) - desconto);
                    instalador.put("valorServico", valorServico);
                    instalador.put("valorMaterial", valorMaterial);
                    instalador.put("desconto", desconto);
                    instalador.put("valorTotal", valorTotal);
                    instalador.put("materialIncluso", materialIncluso);
                    orcamentoMap.put(rs.getString("sfid"),instaladores.size());
                }else{
                    instalador.put("valorServico", 0);
                    instalador.put("valorMaterial", 0);
                    instalador.put("desconto", 0);
                    instalador.put("valorTotal", 0);
                    instalador.put("materialIncluso", 0);
                }
                instalador.put("servicos", new JSONArray());
                instalador.put("materiais", new JSONArray());
            }else{
                instalador.put("orcamento", null);
            }
            instalador.put("status", orcamentoStatus);
            instaladores.add(instalador);
        }
        projeto.put("instaladores", instaladores);

        if (orcamentoMap.size() > 0){
            rs = this.executeQuery(
                "SELECT A.orcamento__c, A.servico__c, A.outros_servico__c,"+
                      " A.preco_unitario__c, A.quantidade__c,"+
                      " B.name, B.unidade__c"+
                " FROM salesforce.instalefacil_orcamento_servico__c A"+
                        " LEFT JOIN salesforce.instalefacil_servico__c B"+
                                " ON B.sfid = A.servico__c"+
                                " AND B.isdeleted = false"+
                " WHERE A.orcamento__c IN ('"+AppUtils.implode("','",orcamentoMap.keySet())+"')"+
                " AND A.isdeleted = false"
            );
            while(rs.next()){
                String orcamentoSFId = rs.getString("orcamento__c");
                if (orcamentoMap.containsKey(orcamentoSFId)){
                    JSONArray servicos = (JSONArray)
                        ((JSONObject) instaladores.get(
                                orcamentoMap.get(orcamentoSFId))
                            ).get("servicos");
                    String descricao = rs.getString("outros_servico__c");
                    if (descricao == null || descricao.compareTo(" ") <= 0){
                        descricao = rs.getString("name");
                    }
                    JSONObject servico = new JSONObject();
                    servico.put("sfid", rs.getString("servico__c"));
                    servico.put("descricao", descricao);
                    servico.put("precoUnitario", rs.getDouble("preco_unitario__c"));
                    servico.put("quantidade", rs.getDouble("quantidade__c"));
                    servico.put("unidade", rs.getString("unidade__c"));
                    servicos.add(servico);
                }
            }
            rs = this.executeQuery(
                "SELECT A.orcamento__c, A.material__c, A.outros_material__c,"+
                    " A.quantidade__c, B.name, B.sub_categoria__c, B.unidade__c"+
                " FROM salesforce.instalefacil_orcamento_material__c A"+
                        " LEFT JOIN salesforce.instalefacil_material__c B"+
                                " ON B.sfid = A.material__c"+
                                " AND B.isdeleted = false"+
                " WHERE A.orcamento__c IN ('"+AppUtils.implode("','",orcamentoMap.keySet())+"')"+
                " AND A.isdeleted = false"
            );
            while(rs.next()){
                String orcamentoSFId = rs.getString("orcamento__c");
                if (orcamentoMap.containsKey(orcamentoSFId)){
                    JSONArray materiais = (JSONArray)
                        ((JSONObject) instaladores.get(
                                orcamentoMap.get(orcamentoSFId)
                            )).get("materiais");
                    String descricao = rs.getString("outros_material__c");
                    if (descricao == null || descricao.compareTo(" ") <= 0){
                        descricao = rs.getString("name");
                    }
                    JSONObject material = new JSONObject();
                    material.put("sfid", rs.getString("material__c"));
                    material.put("descricao", descricao);
                    material.put("categoria", rs.getString("sub_categoria__c"));
                    material.put("quantidade", rs.getDouble("quantidade__c"));
                    material.put("unidade", rs.getString("unidade__c"));
                    materiais.add(material);
                }
            }
        }

        rs = this.executeQuery(
            "SELECT A.apiname, A.label, B.quantidade_contratada__c,"+
                    " B.quantidade_informada__c"+
            " FROM salesforce.instalefacil_picklist_table A"+
                    " LEFT JOIN salesforce.instalefacil_projeto_equipamento__c B"+
                    " ON B.projeto__c = '"+this.escape(projetoSFId)+"'"+
                    " AND B.equipamento__c = A.apiname"+
                    " AND B.isdeleted = false"+
            " WHERE A.fieldname = 'Equipamento'"+
            " AND A.isdeleted = false"+
            " ORDER BY A.apiname ASC"
        );
        while(rs.next()){
            Double quantidade = rs.getDouble("quantidade_informada__c");
            if (quantidade <= 0D){
                quantidade = rs.getDouble("quantidade_contratada__c");
            }
            JSONObject equipamento = new JSONObject();
            equipamento.put("tipo",      rs.getString("apiname"));
            equipamento.put("descricao", rs.getString("label"));
            equipamento.put("quantidade",quantidade);
            equipamentos.add(equipamento);
        }
        projeto.put("equipamentos", equipamentos);

        rs = this.executeQuery(
            "SELECT A.id, A.tipo__c, A.status__c,"+
                  " A.motivo_rejeicao__c, A.imageid__c, A.imageurl__c" +
            " FROM salesforce.instalefacil_projeto_foto__c A" +
            " WHERE A.projeto__c = '"+this.escape(projetoSFId)+"'" +
            " AND A.isdeleted = false"+
            " ORDER BY A.tipo__c ASC, A.id ASC"
        );
        while(rs.next()){
            JSONObject foto = new JSONObject();
            foto.put("id", rs.getLong("id"));
            foto.put("tipo", rs.getString("tipo__c"));
            foto.put("imageURL", rs.getString("imageurl__c"));
            foto.put("motivo", rs.getString("motivo_rejeicao__c"));
            foto.put("status", rs.getString("status__c"));
            fotos.add(foto);
        }
        projeto.put("fotos", fotos);

        JSONObject returnData = new JSONObject();
        returnData.put("projeto", projeto);
        return returnData;
    }

}
