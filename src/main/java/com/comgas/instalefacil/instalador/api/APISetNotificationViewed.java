package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.instalador.APIHandler;
import com.comgas.instalefacil.core.AppUtils;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/set-notification-viewed")
public class APISetNotificationViewed extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        Boolean setAll = (inputData.containsKey("setAll")
                ? Boolean.valueOf(inputData.get("setAll").toString()) : false);
        if (setAll){
            JSONArray ids = new JSONArray();
            ResultSet rs = this.executeQuery(
                "SELECT id"+
                " FROM salesforce.instalefacil_action__c"+
                " WHERE instalador__c = '"+this.getUserSFId()+"'"+
                " AND visualizado__c = false"
            );
            while(rs.next()){
                ids.add( rs.getLong("id") );
            }
            this.executeSQL(
                "UPDATE salesforce.instalefacil_action__c "+
                " SET visualizado__c = true"+
                " WHERE instalador__c = '"+this.getUserSFId()+"'"+
                " AND visualizado__c = false"
            );
            Boolean visualizado = (ids.size() > 0);
            JSONObject returnData = new JSONObject();
            returnData.put("ids", ids);
            returnData.put("visualizado", visualizado);
            return returnData;
        }else if (inputData.containsKey("id")){
            Long id = Long.valueOf(inputData.get("id").toString());
            this.executeSQL(
                "UPDATE salesforce.instalefacil_action__c "+
                " SET visualizado__c = true"+
                " WHERE id = "+id+
                " AND instalador__c = '"+this.getUserSFId()+"'"
            );
            ResultSet rs = this.executeQuery(
                "SELECT visualizado__c"+
                " FROM salesforce.instalefacil_action__c"+
                " WHERE id = "+id+
                " AND instalador__c = '"+this.getUserSFId()+"'"
            );
            if(rs.next()){
                String visualizado = rs.getString("visualizado__c");
                JSONObject returnData = new JSONObject();
                returnData.put("visualizado", visualizado);
                return returnData;
            }
        }else if (inputData.containsKey("ids")){
            JSONArray ids = (JSONArray) inputData.get("ids");
            ArrayList<Long> actionIds = new ArrayList<>();
            for(int i=0; i < ids.size(); i++){
                Long id = Long.valueOf(ids.get(i).toString());
                actionIds.add( id );
            }
            if (actionIds.size() > 0){
                ids = new JSONArray();
                this.executeSQL(
                    "UPDATE salesforce.instalefacil_action__c "+
                    " SET visualizado__c = true"+
                    " WHERE id IN ("+AppUtils.implode(",",actionIds)+")"+
                    " AND instalador__c = '"+this.getUserSFId()+"'"
                );
                ResultSet rs = this.executeQuery(
                    "SELECT id"+
                    " FROM salesforce.instalefacil_action__c"+
                    " WHERE id IN ("+AppUtils.implode(",",actionIds)+")"+
                    " AND instalador__c = '"+this.getUserSFId()+"'"
                );
                while(rs.next()){
                    ids.add( rs.getLong("id") );
                }
                if (ids.size() > 0){
                    JSONObject returnData = new JSONObject();
                    returnData.put("ids", ids);
                    returnData.put("visualizado", true);
                    return returnData;
                }
            }
        }
        throw new AppException("Invalid Parameters", "APISetNotificationViewed.execute");
    }

}
