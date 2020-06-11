package com.comgas.instalefacil.cliente.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.cliente.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/cliente/api/load-user-data")
public class APILoadUserData extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {
        
        long userId = this.getUserId();
        
        ResultSet rs = this.executeQuery(
            "SELECT id, sfid, email__c, name,"+
            " cpf__c, celular__c, telefone__c,"+
            " status_ativacao__c, status__c" +
            " FROM salesforce.instalefacil_cliente__c" +
            " WHERE id = " + userId +
            " AND isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load user data", "APILoadUserData.execute");
        }

        JSONObject returnData = new JSONObject();
        returnData.put("email",     rs.getString("email__c"));
        returnData.put("nome",      rs.getString("name"));
        returnData.put("cpf",       rs.getString("cpf__c"));
        returnData.put("celular",   rs.getString("celular__c"));
        returnData.put("telefone",  rs.getString("telefone__c"));
        returnData.put("ativacao",  rs.getString("status_ativacao__c"));
        returnData.put("status",    rs.getString("status__c"));

        Boolean complete = (inputData.containsKey("complete") ?
                Boolean.valueOf(inputData.get("complete").toString()) : false);

        if (complete){
            JSONArray projetos = new JSONArray();
            rs = this.executeQuery(
                "SELECT A.id, A.sfid, A.numero__c, A.cnpj__c, A.razao_social__c,"+
                    " A.ramo_atividade__c, A.name, A.logradouro__c,"+
                    " A.complemento__c, A.bairro__c, A.cidade__c,"+
                    " A.estado__c, A.cep__c, A.status__c"+
                " FROM salesforce.instalefacil_projeto__c A"+
                " WHERE A.cliente__c = '"+this.getUserSFId()+"'"+
                " AND A.status__c > '0A'"+
                " AND A.isdeleted = false"+
                " ORDER BY A.systemmodstamp DESC"
            );
            while(rs.next()){
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
                projetos.add(projeto);
            }
            returnData.put("projetos", projetos);
        }
        return returnData;
    }

}
