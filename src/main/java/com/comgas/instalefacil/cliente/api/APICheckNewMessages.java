package com.comgas.instalefacil.cliente.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.cliente.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONObject;

@WebServlet("/cliente/api/check-new-messages")
public class APICheckNewMessages extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        if (!inputData.containsKey("id")){
            throw new AppException("Invalid Parameters", "APICheckNewMessages.execute");
        }
        Long id = Long.valueOf(inputData.get("id").toString());
        int messageCount = 0;
        ResultSet rs = this.executeQuery(
            "SELECT COUNT(*) AS messageCount"+
            " FROM salesforce.instalefacil_projeto__c A"+
                ", salesforce.instalefacil_orcamento__c B"+
                ", salesforce.instalefacil_messenger C"+
            " WHERE A.id = "+id+
            " AND A.cliente__c = '"+this.getUserSFId()+"'"+
            " AND A.isdeleted = false"+
            " AND B.projeto__c = A.sfid"+
            " AND B.status__c <> '9D'"+
            " AND B.status__c <> '9X'"+
            " AND B.isdeleted = false"+
            " AND C.orcamento_id = B.id"+
            " AND C.sender = 'I'"+
            " AND C.ispending = true"
        );
        if(rs.next()){
            messageCount = rs.getInt("messageCount");
        }
        JSONObject returnData = new JSONObject();
        returnData.put("messageCount", messageCount);
        return returnData;
    }

}
