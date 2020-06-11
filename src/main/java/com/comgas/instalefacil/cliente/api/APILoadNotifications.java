package com.comgas.instalefacil.cliente.api;

import com.comgas.instalefacil.core.AppException;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/cliente/api/load-notifications")
public class APILoadNotifications extends APIBaseNotifications {

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        if (!inputData.containsKey("id")){
            throw new AppException("Invalid Parameters", "APILoadNotifications.execute");
        }
        Long id = Long.valueOf(inputData.get("id").toString());
        String sfid = this.getUserSFId();
        this.checkExpiredActions(id);
        ResultSet rs = this.executeQuery(
            "SELECT C.id, B.id AS orcamento, C.action__c, C.createddate, D.name"+
            " FROM salesforce.instalefacil_projeto__c A"+
                ", salesforce.instalefacil_action__c C"+
                ", salesforce.instalefacil_orcamento__c B"+
                    " JOIN salesforce.instalefacil_instalador__c D"+
                        " ON D.sfid = B.instalador__c"+
                        " AND D.isdeleted = false"+
            " WHERE A.id = "+id+
            " AND A.cliente__c = '"+sfid+"'"+
            " AND A.isdeleted = false"+
            " AND C.projeto__c = A.sfid"+
            " AND C.cliente__c = '"+sfid+"'"+
            " AND C.action__c NOT IN ('CreatePassword','ConstructionTips','ResetPassword','EmailChecked')"+
            " AND C.visualizado__c = false"+
            " AND B.sfid = C.orcamento__c"+
            " AND B.projeto__c = A.sfid"+
            " AND B.status__c <> '9D'"+
            " AND B.status__c <> '9X'"+
            " AND B.isdeleted = false"
        );
        JSONArray notifications = new JSONArray();
        while(rs.next()){
            JSONObject notification = new JSONObject();
            notification.put("id", rs.getLong("id"));
            notification.put("tipo", rs.getString("action__c"));
            notification.put("orcamento", rs.getLong("orcamento"));
            notification.put("instalador", rs.getString("name"));
            notification.put("createddate", rs.getString("createddate"));
            notifications.add(notification);
        }
        JSONObject returnData = new JSONObject();
        returnData.put("notifications", notifications);
        return returnData;
    }

}
