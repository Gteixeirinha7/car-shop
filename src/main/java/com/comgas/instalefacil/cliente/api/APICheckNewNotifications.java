package com.comgas.instalefacil.cliente.api;

import com.comgas.instalefacil.core.AppException;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONObject;

@WebServlet("/cliente/api/check-new-notifications")
public class APICheckNewNotifications extends APIBaseNotifications {

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        if (!inputData.containsKey("id")){
            throw new AppException("Invalid Parameters", "APICheckNotifications.execute");
        }
        Long id = Long.valueOf(inputData.get("id").toString());
        this.checkExpiredActions(id);
        int notificationCount = 0;
        ResultSet rs = this.executeQuery(
            "SELECT COUNT(*) AS notificationCount"+
            " FROM salesforce.instalefacil_projeto__c A"+
                ", salesforce.instalefacil_orcamento__c B"+
                ", salesforce.instalefacil_action C"+
                    " JOIN salesforce.instalefacil_instalador__c D"+
                        " ON D.sfid = B.instalador__c"+
                        " AND D.isdeleted = false"+
            " WHERE A.id = "+id+
            " AND A.cliente__c = '"+this.getUserSFId()+"'"+
            " AND A.isdeleted = false"+
            " AND B.projeto__c = A.sfid"+
            " AND B.status__c <> '9D'"+
            " AND B.status__c <> '9X'"+
            " AND B.isdeleted = false"+
            " AND C.orcamento__c = B.sfid"+
            " AND C.cliente__c = A.cliente__c"+
            " AND C.action__c NOT IN ('CreatePassword','ConstructionTips','ResetPassword','EmailChecked')"+
            " AND C.visualizado__c = false"
        );
        if(rs.next()){
            notificationCount = rs.getInt("notificationCount");
        }
        JSONObject returnData = new JSONObject();
        returnData.put("notificationCount", notificationCount);
        return returnData;
    }

}
