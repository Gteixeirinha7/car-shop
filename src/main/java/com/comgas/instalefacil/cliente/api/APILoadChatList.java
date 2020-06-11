package com.comgas.instalefacil.cliente.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.cliente.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/cliente/api/load-chat-list")
public class APILoadChatList extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        if (!inputData.containsKey("id")){
            throw new AppException("Invalid Parameters", "APILoadChatList.execute");
        }
        Long id = Long.valueOf(inputData.get("id").toString());
        JSONArray chats = new JSONArray();
        ResultSet rs = this.executeQuery(
            "SELECT B.id, D.name, C.sender,"+
                  " C.ispending, C.message, C.createddate"+
            " FROM salesforce.instalefacil_projeto__c A"+
                ", salesforce.instalefacil_orcamento__c B"+
                    " JOIN salesforce.instalefacil_instalador__c D"+
                        " ON D.sfid = B.instalador__c"+
                        " AND D.isdeleted = false"+
                ", salesforce.instalefacil_messenger C"+
            " WHERE A.id = "+id+
            " AND A.cliente__c = '"+this.getUserSFId()+"'"+
            " AND A.isdeleted = false"+
            " AND B.projeto__c = A.sfid"+
            " AND B.status__c <> '9D'"+
            " AND B.status__c <> '9X'"+
            " AND B.isdeleted = false"+
            " AND C.orcamento_id = B.id"+
            " AND C.id = (SELECT MAX(X.id)"+
                          " FROM salesforce.instalefacil_messenger X"+
                          " WHERE X.orcamento_id = B.id)"+
            " ORDER BY C.id DESC"+
            " LIMIT 500"
        );
        while(rs.next()){
            JSONObject chat = new JSONObject();
            chat.put("id", rs.getLong("id"));
            chat.put("instalador", rs.getString("name"));
            chat.put("sender", rs.getString("sender"));
            chat.put("ispending", rs.getBoolean("ispending"));
            chat.put("message", rs.getString("message"));
            chat.put("createddate", rs.getString("createddate"));
            chats.add(chat);
        }
        JSONObject returnData = new JSONObject();
        returnData.put("chats", chats);
        return returnData;
    }

}
