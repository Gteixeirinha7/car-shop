package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/check-new-notifications")
public class APICheckNewNotifications extends APIBaseNotifications {

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {
        this.checkExpiredActions();
        int notificationCount = 0;
        ResultSet rs = this.executeQuery(
            "SELECT COUNT(*) AS notificationCount"+
            " FROM salesforce.instalefacil_orcamento__c A"+
                    " JOIN salesforce.instalefacil_projeto__c C"+
                        " ON C.sfid = A.projeto__c"+
                        " AND C.isdeleted = false"+
                ", salesforce.instalefacil_action B"+
            " WHERE A.instalador__c = '"+this.getUserSFId()+"'"+
            " AND A.status__c <> '9D'"+
            " AND A.status__c <> '9X'"+
            " AND A.isdeleted = false"+
            " AND B.orcamento__c = A.sfid"+
            " AND B.instalador__c = A.instalador__c"+
            " AND B.action__c NOT IN ('CreatePassword','ConstructionTips','ResetPassword','EmailChecked')"+
            " AND B.visualizado__c = false"
        );
        if(rs.next()){
            notificationCount = rs.getInt("notificationCount");
        }
        JSONObject returnData = new JSONObject();
        returnData.put("notificationCount", notificationCount);
        return returnData;
    }

}
