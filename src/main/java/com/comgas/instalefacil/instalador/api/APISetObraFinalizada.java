package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.instalador.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/set-obra-finalizada")
public class APISetObraFinalizada extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {
        
        if (!inputData.containsKey("id")){
            throw new AppException("Invalid Parameters", "APISetObraFinalizada.execute");
        }
        Long id = Long.valueOf(inputData.get("id").toString());
        ResultSet rs = this.executeQuery(
            "SELECT sfid, status__c"+
            " FROM salesforce.instalefacil_projeto__c"+
            " WHERE id = "+id+
            " AND isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load project", "APISetObraFinalizada.execute");
        }
        String sfid = rs.getString("sfid");
        String status = rs.getString("status__c");
        HashMap<String,Integer> fotoTipos = new HashMap<>();
        rs = this.executeQuery(
            "SELECT A.tipo__c, A.status__c"+
            " FROM salesforce.instalefacil_projeto_foto__c A" +
            " WHERE A.projeto__c = '"+this.escape(sfid)+"'" +
            " AND A.isdeleted = false"
        );
        while(rs.next()){
            String fotoTipo = rs.getString("tipo__c");
            String fotoStatus = rs.getString("status__c");
            if (!fotoStatus.equals("3D")){
                fotoTipos.put(
                    fotoTipo,
                    (fotoTipos.containsKey(fotoTipo) ? fotoTipos.get(fotoTipo) : 1)
                );
            }
        }
        if (status.equals("3A") && fotoTipos.size() > 4){
            status = "3B";
            this.executeSQL(
                "UPDATE salesforce.instalefacil_projeto__c "+
                " SET status__c = '"+status+"'"+
                " WHERE id = "+id+
                " AND status__c = '3A'"
            );
        }
        JSONObject returnData = new JSONObject();
        returnData.put("status", status);
        return returnData;
    }

}
