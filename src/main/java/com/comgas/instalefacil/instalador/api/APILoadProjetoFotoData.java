package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.instalador.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/load-projeto-foto-data")
public class APILoadProjetoFotoData extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {
        
        if (!inputData.containsKey("id")){
            throw new AppException("Invalid Parameters", "APILoadFotoData.execute");
        }
        Long id = Long.valueOf(inputData.get("id").toString());
        ResultSet rs = this.executeQuery(
            "SELECT A.sfid, A.instalador_enviafotos__c,"+
                  " A.contrato__c, A.contrato_externo__c"+
            " FROM salesforce.instalefacil_projeto__c A"+
            " WHERE A.id = "+id+
            " AND A.instalador__c = '"+this.escape(this.getUserSFId())+"'"+
            " AND A.status__c > '2A'"+
            " AND A.isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load project", "APILoadFotoData.execute");
        }

        String projetoSFId = rs.getString("sfid");
        Boolean instaladorEnviaFotos = rs.getBoolean("instalador_enviafotos__c");
        if (instaladorEnviaFotos){
            instaladorEnviaFotos = (
                rs.getBoolean("contrato_externo__c")
                    || (rs.getString("contrato__c") != null
                            && rs.getString("contrato__c").compareTo(" ") > 0)
            );
        }
        JSONArray fotos = new JSONArray();

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

        JSONObject returnData = new JSONObject();
        returnData.put("fotos", fotos);
        returnData.put("enviaFotos", instaladorEnviaFotos);
        return returnData;
    }

}
