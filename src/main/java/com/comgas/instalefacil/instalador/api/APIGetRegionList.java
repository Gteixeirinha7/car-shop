package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.instalador.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/get-region-list")
public class APIGetRegionList extends APIHandler {

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {
        ResultSet rs = this.executeQuery(
            "SELECT area__c, name"+
            " FROM salesforce.instalefacil_regiao__c" +
            " WHERE isdeleted = false" +
            " ORDER BY area__c, name"
        );
        JSONArray areas = new JSONArray();
        HashMap<String,Integer> areaMap = new HashMap<>();
        while (rs.next()){
            JSONArray regioes;
            String areaNome = rs.getString("area__c");
            String regiaoNome = rs.getString("name");
            if (areaNome != null && areaNome.compareTo(" ") > 0
                    && regiaoNome != null && regiaoNome.compareTo(" ") > 0)
            {
                if (areaMap.containsKey(areaNome)){
                    regioes = (JSONArray) ((JSONObject) areas.get(areaMap.get(areaNome))).get("regioes");
                }else{
                    regioes = new JSONArray();
                    JSONObject area = new JSONObject();
                    area.put("nome", areaNome);
                    area.put("regioes", regioes);
                    area.put("selected", false);
                    int i = areas.size();
                    areaMap.put(areaNome, i);
                    areas.add(area);
                }
                regioes.add(rs.getString("name"));
            }
        }
        rs = this.executeQuery(
            "SELECT DISTINCT B.area__c"+
            " FROM salesforce.instalefacil_regiao_instalador__c A"+
                ", salesforce.instalefacil_regiao__c B" +
            " WHERE A.instalador__c = '"+this.getUserSFId()+"'"+
            " AND A.isdeleted = false"+
            " AND B.sfid = A.regiao__c"+
            " AND B.isdeleted = false"
        );
        while (rs.next()){
            String areaNome = rs.getString("area__c");
            if (areaNome != null && areaMap.containsKey(areaNome)){
                ((JSONObject) areas.get(areaMap.get(areaNome))).put("selected", true);
            }
        }        
        JSONObject returnData = new JSONObject();
        returnData.put("areas", areas);
        return returnData;
    }

}
