package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/load-notifications")
public class APILoadNotifications extends APIBaseNotifications {

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {
        this.checkExpiredActions();
        String sfid = this.getUserSFId();
        ResultSet rs = this.executeQuery(
            "SELECT B.id, A.id AS orcamento, B.action__c,"+
                  " B.createddate, C.razao_social__c"+
            " FROM salesforce.instalefacil_orcamento__c A"+
                    " JOIN salesforce.instalefacil_projeto__c C"+
                        " ON C.sfid = A.projeto__c"+
                        " AND C.isdeleted = false"+
                ", salesforce.instalefacil_action__c B"+
            " WHERE A.instalador__c = '"+sfid+"'"+
            //" AND A.status__c <> '9D'"+
            " AND A.status__c <> '9X'"+
            " AND A.isdeleted = false"+
            " AND B.orcamento__c = A.sfid"+
            " AND B.instalador__c = '"+sfid+"'"+
            " AND B.action__c NOT IN ('CreatePassword','ConstructionTips','ResetPassword','EmailChecked')"+
            " AND B.visualizado__c = false"
        );
        JSONArray notifications = new JSONArray();
        while(rs.next()){
            JSONObject notification = new JSONObject();
            notification.put("id", rs.getLong("id"));
            notification.put("tipo", rs.getString("action__c"));
            notification.put("orcamento", rs.getLong("orcamento"));
            notification.put("razao", rs.getString("razao_social__c"));
            notification.put("createddate", rs.getString("createddate"));
            notifications.add(notification);
        }
        JSONObject returnData = new JSONObject();
        returnData.put("notifications", notifications);
        return returnData;
    }

}
