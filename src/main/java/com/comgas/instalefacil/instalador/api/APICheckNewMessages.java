package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.instalador.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/check-new-messages")
public class APICheckNewMessages extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        int messageCount = 0;
        ResultSet rs = this.executeQuery(
            "SELECT COUNT(*) AS messageCount"+
            " FROM salesforce.instalefacil_orcamento__c A"+
                ", salesforce.instalefacil_messenger B"+
            " WHERE A.instalador__c = '"+this.getUserSFId()+"'"+
            " AND A.status__c <> '9D'"+
            " AND A.status__c <> '9X'"+
            " AND A.isdeleted = false"+
            " AND B.orcamento_id = A.id"+
            " AND B.sender = 'C'"+
            " AND B.ispending = true"
        );
        if(rs.next()){
            messageCount = rs.getInt("messageCount");
        }
        JSONObject returnData = new JSONObject();
        returnData.put("messageCount", messageCount);
        return returnData;
    }

}
