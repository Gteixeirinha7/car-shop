package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.core.AppUtils;
import com.comgas.instalefacil.instalador.APIHandler;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/set-area-atuacao")
public class APISetAreaAtuacao extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {
        long userId = this.getUserId();
        ResultSet rs = this.executeQuery(
            "SELECT id, status_ativacao__c, status__c" +
            " FROM salesforce.instalefacil_instalador__c " +
            " WHERE id = " + userId +
            " AND isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load user data", "APISetAreaAtuacao.execute");
        }

        String ativacao = rs.getString("status_ativacao__c");
        String status = rs.getString("status__c");

        if (ativacao.compareTo("1D") < 0){
            throw new AppException(500,"Selecione uma ou mais regiões");
        }

        ArrayList<String> areas = new ArrayList<>();
        JSONArray regioes = new JSONArray();

        if(inputData.containsKey("areas")){
            JSONArray a = (JSONArray) inputData.get("areas");
            for(int i=0; i < a.size(); i++){
                areas.add(this.escape(a.get(i).toString()));
            }
        }
        if (areas.size() > 0){
            PreparedStatement insertRegiaoAtuacao = this.getInsertStatement(
                "salesforce.instalefacil_regiao_instalador__c",
                "regiao__c,instalador__c,externalid__c,isdeleted=false"
            );
            rs = this.executeQuery(
                "SELECT sfid, name, area__c" +
                " FROM salesforce.instalefacil_regiao__c " +
                " WHERE area__c IN ('"+AppUtils.implode("','",areas)+"')"+
                " AND isdeleted = false"+
                " ORDER BY area__c, name"
            );
            int n = 0;
            while(rs.next()){
                JSONObject regiao = new JSONObject();
                regiao.put("id",rs.getString("sfid"));
                regiao.put("name",rs.getString("name"));
                regiao.put("area",rs.getString("area__c"));
                regioes.add(regiao);
                insertRegiaoAtuacao.setString(1, rs.getString("sfid"));
                insertRegiaoAtuacao.setString(2, this.getUserSFId());
                insertRegiaoAtuacao.setString(3, AppUtils.toUUID(0));
                insertRegiaoAtuacao.addBatch();
                n++;
            }
            if (n > 0){
                this.executeSQL(
                    "DELETE FROM salesforce.instalefacil_regiao_instalador__c"+
                    " WHERE instalador__c = '"+this.getUserSFId()+"'"
                );
                insertRegiaoAtuacao.executeBatch();
                if (ativacao.equals("1D")){
                    ativacao = "2A";
                    this.executeSQL(
                        "UPDATE salesforce.instalefacil_instalador__c"+
                        " SET status_ativacao__c = '"+this.escape(ativacao)+"'"+
                        " WHERE id = " + userId
                    );
                }
            }
        }
        JSONObject returnData = new JSONObject();
        returnData.put("regioes", regioes);
        returnData.put("ativacao",ativacao);
        returnData.put("status",  status);
        return returnData;
    }

}
