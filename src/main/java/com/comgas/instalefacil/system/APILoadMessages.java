package com.comgas.instalefacil.system;

import com.comgas.instalefacil.core.AppException;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/system/api/load-messages")
public class APILoadMessages extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        if (!inputData.containsKey("orcamento")){
            throw new AppException("Invalid Parameters", "APILoadMessages.execute");
        }
        String orcamentoSFId = inputData.get("orcamento").toString();
        ResultSet rs = this.executeQuery(
            "SELECT id"+
            " FROM salesforce.instalefacil_orcamento__c"+
            " WHERE sfid = '"+this.escape(orcamentoSFId)+"'"+
            " AND isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load quotation", "APILoadMessages.execute");
        }
        Long id = rs.getLong("id");
        rs = this.executeQuery(
            "SELECT A.sender, A.message, A.createddate"+
            " FROM salesforce.instalefacil_messenger A"+
            " WHERE A.orcamento_id = "+id+
            " ORDER BY A.id ASC"
        );
        JSONArray messages = new JSONArray();
        while(rs.next()){
            JSONObject message = new JSONObject();
            message.put("sender", rs.getString("sender"));
            message.put("message", rs.getString("message"));
            message.put("createddate", rs.getString("createddate"));
            messages.add(message);
        }
        JSONObject returnData = new JSONObject();
        returnData.put("messages", messages);
        return returnData;
    }

}
