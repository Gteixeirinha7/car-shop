package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.instalador.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/load-orcamento-data")
public class APILoadOrcamentoData extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        String whereClause;
        if (inputData.containsKey("id")){
            whereClause = "id = "+Long.valueOf(inputData.get("id").toString());
        }else if (inputData.containsKey("projeto")){
            whereClause = "projeto__c = '"+this.escape(inputData.get("projeto").toString())+"'";
        }else{
            throw new AppException("Invalid Parameters", "APILoadOrcamentoData.execute");
        }
        ResultSet rs = this.executeQuery(
            "SELECT id, sfid, projeto__c, valor_servico__c, valor_material__c,"+
                  " desconto__c, material_incluso__c, status__c"+
            " FROM salesforce.instalefacil_orcamento__c"+
            " WHERE "+whereClause+
            " AND instalador__c = '"+this.getUserSFId()+"'"+
            " AND isdeleted = false "
        );
        if(!rs.next()){
            throw new AppException("Fail to load quotation", "APILoadOrcamentoData.execute");
        }

        Long id = rs.getLong("id");
        String orcamentoSFId = rs.getString("sfid");
        String projetoSFId = rs.getString("projeto__c");
        String status = rs.getString("status__c");

        Double valorServico = rs.getDouble("valor_servico__c");
        Double valorMaterial = rs.getDouble("valor_material__c");
        Double desconto = rs.getDouble("desconto__c");
        Double valorTotal = valorServico + valorMaterial - desconto;

        JSONObject orcamento = new JSONObject();
        orcamento.put("id", id);
        orcamento.put("valorServico", valorServico);
        orcamento.put("valorMaterial", valorMaterial);
        orcamento.put("desconto", desconto);
        orcamento.put("valorTotal", valorTotal);
        orcamento.put("materialIncluso", rs.getBoolean("material_incluso__c"));
        orcamento.put("status",   rs.getString("status__c"));

        JSONArray servicos = new JSONArray();
        JSONArray materiais = new JSONArray();

        rs = this.executeQuery(
            "SELECT A.servico__c, A.outros_servico__c,"+
                  " A.preco_unitario__c, A.quantidade__c"+
            " FROM salesforce.instalefacil_orcamento_servico__c A"+
            " WHERE A.orcamento__c = '"+orcamentoSFId+"'"+
            " AND A.isdeleted = false"+
            " ORDER BY A.id ASC"
        );
        while(rs.next()){
            JSONObject servico = new JSONObject();
            servico.put("sfid", rs.getString("servico__c"));
            servico.put("descricao", rs.getString("outros_servico__c"));
            servico.put("precoUnitario", rs.getDouble("preco_unitario__c"));
            servico.put("quantidade", rs.getDouble("quantidade__c"));
            servicos.add(servico);
        }
        orcamento.put("servicos", servicos);

        rs = this.executeQuery(
            "SELECT A.material__c, A.outros_material__c, A.quantidade__c"+
            " FROM salesforce.instalefacil_orcamento_material__c A"+
            " WHERE A.orcamento__c = '"+orcamentoSFId+"'"+
            " AND A.isdeleted = false"+
            " ORDER BY A.id ASC"
        );
        while(rs.next()){
            JSONObject material = new JSONObject();
            material.put("sfid", rs.getString("material__c"));
            material.put("descricao", rs.getString("outros_material__c"));
            material.put("quantidade", rs.getDouble("quantidade__c"));
            materiais.add(material);
        }
        orcamento.put("materiais", materiais);

        JSONObject returnData = new JSONObject();
        returnData.put("orcamento", orcamento);


        Boolean complete = (inputData.containsKey("complete") ?
                Boolean.valueOf(inputData.get("complete").toString()) : false);

        if (complete){
            JSONArray servicoList = new JSONArray();
            JSONArray materialList = new JSONArray();
            rs = this.executeQuery(
                "SELECT A.sfid, A.name, A.unidade__c, A.edita_descricao__c"+
                " FROM salesforce.instalefacil_servico__c A"+
                " WHERE A.isdeleted = false"+
                " ORDER BY A.name ASC"
            );
            while(rs.next()){
                JSONObject servico = new JSONObject();
                servico.put("sfid", rs.getString("sfid"));
                servico.put("descricao", rs.getString("name"));
                servico.put("unidade", rs.getString("unidade__c"));
                servico.put("editar", rs.getBoolean("edita_descricao__c"));
                servicoList.add(servico);
            }
            returnData.put("servicoList", servicoList);
            rs = this.executeQuery(
                "SELECT A.sfid, A.name, A.unidade__c,"+
                      " A.sub_categoria__c, A.edita_descricao__c"+
                " FROM salesforce.instalefacil_material__c A"+
                " WHERE A.isdeleted = false"+
                " ORDER BY A.name ASC"
            );
            while(rs.next()){
                JSONObject material = new JSONObject();
                material.put("sfid", rs.getString("sfid"));
                material.put("descricao", rs.getString("name"));
                material.put("unidade", rs.getString("unidade__c"));
                material.put("categoria", rs.getString("sub_categoria__c"));
                material.put("editar", rs.getBoolean("edita_descricao__c"));
                materialList.add(material);
            }
            returnData.put("materialList", materialList);
        }

        return returnData;
    }

}
