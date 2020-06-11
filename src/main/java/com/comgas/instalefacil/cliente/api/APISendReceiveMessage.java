package com.comgas.instalefacil.cliente.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.core.AppUtils;
import com.comgas.instalefacil.cliente.APIHandler;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/cliente/api/send-receive-message")
public class APISendReceiveMessage extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        if (!inputData.containsKey("id")){
            throw new AppException("Invalid Parameters", "APISendReceiveMessage.execute");
        }
        Long id = Long.valueOf(inputData.get("id").toString());
        Long lastMessageId = 0L;
        Long firstMessageId = 0L;
        if (inputData.containsKey("lastMessageId")){
            lastMessageId = Long.valueOf(inputData.get("lastMessageId").toString());
        }else if (inputData.containsKey("firstMessageId")){
            firstMessageId = Long.valueOf(inputData.get("lastMessageId").toString());
        }
        ResultSet rs = this.executeQuery(
            "SELECT status__c"+
            " FROM salesforce.instalefacil_orcamento__c"+
            " WHERE id = "+id+
            " AND cliente__c = '"+this.getUserSFId()+"'"+
            " AND isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load quotation", "APISendReceiveMessage.execute");
        }
        if (inputData.containsKey("messages")){
            JSONArray messages = (JSONArray) inputData.get("messages");
            PreparedStatement insertMessages = this.getInsertStatement(
                "salesforce.instalefacil_messenger",
                "orcamento_id,message,sender='C',ispending=true,createddate=now()"
            );
            int n = 0;
            for(int i=0; i < messages.size(); i++){
                String message = (String) messages.get(i);
                if (message != null && message.compareTo(" ") > 0){
                    if (message.length() > 100000){
                        throw new AppException("Message to long", "APISendReceiveMessage.execute");
                    }
                    insertMessages.setLong(1, id);
                    insertMessages.setString(2, message);
                    insertMessages.addBatch();
                    n++;
                }
            }
            if (n > 0){
                insertMessages.executeBatch();
                firstMessageId = 0L;
            }
        }
        if (lastMessageId > 0){
            rs = this.executeQuery(
                "SELECT A.id, A.sender, A.ispending, A.message, A.createddate"+
                " FROM salesforce.instalefacil_messenger A"+
                " WHERE A.orcamento_id = "+id+
                " AND A.id > "+lastMessageId+
                " ORDER BY A.id ASC"
            );
        }else{
            String firstMessageClause;
            if (firstMessageId > 0){
                firstMessageClause = " AND A.id < "+firstMessageId;
            }else{
                firstMessageClause = "";
            }
            rs = this.executeQuery(
                "SELECT A.id, A.sender, A.ispending, A.message, A.createddate"+
                " FROM salesforce.instalefacil_messenger A"+
                " WHERE A.orcamento_id = "+id+
                        firstMessageClause+
                " ORDER BY A.id DESC"+
                " LIMIT 50"
            );
        }        
        JSONArray messages = new JSONArray();
        ArrayList<Long> pendingMessages = new ArrayList<>();
        while(rs.next()){
            JSONObject message = new JSONObject();
            message.put("id", rs.getLong("id"));
            message.put("sender", rs.getString("sender"));
            message.put("message", rs.getString("message"));
            message.put("createddate", rs.getString("createddate"));
            messages.add(message);
            if (rs.getBoolean("ispending") && rs.getString("sender").equals("I")){
                pendingMessages.add( rs.getLong("id") );
            }
        }
        if (pendingMessages.size() > 0){
            this.executeSQL(
                "UPDATE salesforce.instalefacil_messenger"+
                " SET ispending = false"+
                " WHERE orcamento_id = "+id+
                " AND id IN ("+AppUtils.implode(",",pendingMessages)+")"
            );
        }
        JSONObject returnData = new JSONObject();
        returnData.put("messages", messages);
        return returnData;
    }

}
