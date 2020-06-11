package com.comgas.instalefacil.cliente.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.cliente.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONObject;

@WebServlet("/cliente/api/contratar")
public class APIContratar extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        if (!inputData.containsKey("id") && !inputData.containsKey("valorTotal")){
            throw new AppException("Invalid Parameters", "APIContratar.execute");
        }
        Long id = Long.valueOf(inputData.get("id").toString());
        Double valorBaseContratado = Double.valueOf(inputData.get("valorTotal").toString()) * 100;
        ResultSet rs = this.executeQuery(
            "SELECT A.sfid, A.projeto__c, A.instalador__c,"+
                  " A.valor_servico__c, A.valor_material__c,"+
                  " A.desconto__c, A.material_incluso__c,"+
                  " B.status__c AS projetoStatus, A.status__c"+
            " FROM salesforce.instalefacil_orcamento__c A"+
                ", salesforce.instalefacil_projeto__c B"+
            " WHERE A.id = "+id+
            " AND A.isdeleted = false"+
            " AND B.sfid = A.projeto__c"+
            " AND B.cliente__c = '"+this.getUserSFId()+"'"+
            " AND B.isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load quotation", "APIContratar.execute");
        }

        String sfid = rs.getString("sfid");
        String status = rs.getString("status__c");
        String projetoSFId = rs.getString("projeto__c");
        String projetoStatus = rs.getString("projetoStatus");
        String instaladorSFId = rs.getString("instalador__c");
        Boolean instaladorEnviaFotos= (inputData.containsKey("fotos")
            ? Boolean.valueOf(inputData.get("fotos").toString()) : false
        );
        Double valorServico = rs.getDouble("valor_servico__c");
        Double valorMaterial = rs.getDouble("valor_material__c");
        Double desconto = rs.getDouble("desconto__c");
        Boolean materialIncluso = rs.getBoolean("material_incluso__c");
        Double valorBaseOrcado = (valorServico + (materialIncluso ? valorMaterial : 0) - desconto) * 100;
        if (valorBaseContratado.longValue() != valorBaseOrcado.longValue()){
            throw new AppException(601, "O Valor Contratado difere do Orçamento atual");
        }
        if (status.equals("2A") && projetoStatus.equals("2A")){
            status = "9A";
            this.executeSQL(
                "UPDATE salesforce.instalefacil_orcamento__c " +
                " SET status__c = '9A'"+
                " WHERE id = "+id+
                " AND projeto__c = '"+projetoSFId+"'"+
                " AND status__c = '2A'"+
                " AND isdeleted = false"
            );
            this.executeSQL(
                "UPDATE salesforce.instalefacil_orcamento__c " +
                " SET status__c = '9X'"+
                " WHERE projeto__c = '"+projetoSFId+"'"+
                " AND id <> "+id+
                " AND status__c > '0A'"+
                " AND status__c <= '2A'"+
                " AND isdeleted = false"
            );
            this.executeSQL(
                "UPDATE salesforce.instalefacil_projeto__c " +
                " SET status__c = '3A'"+
                   ", orcamento__c = '"+sfid+"'"+
                   ", instalador__c = '"+instaladorSFId+"'"+
                   ", instalador_enviafotos__c = "+instaladorEnviaFotos+
                " WHERE sfid = '"+projetoSFId+"'"+
                " AND status__c = '2A'"+
                " AND isdeleted = false"
            );
        }
        JSONObject returnData = new JSONObject();
        returnData.put("status", status);
        return returnData;
    }

}
