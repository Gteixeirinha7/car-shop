package com.comgas.instalefacil.cliente.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.cliente.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONObject;

@WebServlet("/cliente/api/libera-projeto")
public class APILiberaProjeto extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        if (!inputData.containsKey("id")){
            throw new AppException("Invalid Parameters", "APILiberaProjeto.execute");
        }
        Long id = Long.valueOf(inputData.get("id").toString());
        ResultSet rs = this.executeQuery(
            "SELECT status__c"+
            " FROM salesforce.instalefacil_projeto__c"+
            " WHERE id = "+id+
            " AND cliente__c = '"+this.escape(this.getUserSFId())+"'"+
            " AND isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load project", "APILiberaProjeto.execute");
        }
        JSONObject returnData = new JSONObject();
        String status = rs.getString("status__c");
        if (status.equals("1B")){
            status = "2A";
            this.executeSQL(
                "UPDATE salesforce.instalefacil_projeto__c " +
                " SET status__c = '"+status+"'"+
                " WHERE id = "+id+
                " AND status__c = '1B'"
            );
        }else if (status.equals("2A")){
            this.executeSQL(
                "UPDATE salesforce.instalefacil_projeto__c " +
                " SET convidar_instaladores__c = true"+
                " WHERE id = "+id+
                " AND status__c = '2A'"+
                " AND convidar_instaladores__c <> true"
            );
            returnData.put("convidarInstaladores", true);
        }
        returnData.put("status", status);
        return returnData;
    }

}
