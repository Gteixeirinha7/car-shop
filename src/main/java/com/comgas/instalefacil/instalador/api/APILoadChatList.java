package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.instalador.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/load-chat-list")
public class APILoadChatList extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        JSONArray chats = new JSONArray();
        ResultSet rs = this.executeQuery(
            "SELECT A.id, C.name AS cliente, D.name AS comercio,"+
                  " B.sender, B.ispending, B.message, B.createddate"+
            " FROM salesforce.instalefacil_orcamento__c A"+
                    " JOIN salesforce.instalefacil_cliente__c C"+
                        " ON C.sfid = A.cliente__c"+
                        " AND C.isdeleted = false"+
                    " JOIN salesforce.instalefacil_projeto__c D"+
                        " ON D.sfid = A.projeto__c"+
                        " AND D.isdeleted = false"+
                ", salesforce.instalefacil_messenger B"+
            " WHERE A.instalador__c = '"+this.getUserSFId()+"'"+
            //" AND A.status__c <> '9D'"+
            " AND A.status__c <> '9X'"+
            " AND A.isdeleted = false"+
            " AND B.orcamento_id = A.id"+
            " AND B.id = (SELECT MAX(X.id)"+
                          " FROM salesforce.instalefacil_messenger X"+
                          " WHERE X.orcamento_id = A.id)"+
            " ORDER BY B.id DESC"+
            " LIMIT 500"
        );
        while(rs.next()){
            JSONObject chat = new JSONObject();
            chat.put("id", rs.getLong("id"));
            chat.put("cliente", rs.getString("cliente"));
            chat.put("comercio", rs.getString("comercio"));
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
