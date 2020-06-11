package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.core.AppUtils;
import com.comgas.instalefacil.instalador.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/load-qualificacao-data")
public class APILoadQualificacaoData extends APIHandler {

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {
        long userId = this.getUserId();
        ResultSet rs = this.executeQuery(
            "SELECT sfid, avaliacao__c" +
            " FROM salesforce.instalefacil_instalador__c" +
            " WHERE id = " + userId +
            " AND isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load user data", "APILoadUserData.execute");
        }
        String avaliacao = rs.getString("avaliacao__c");
        if (avaliacao == null || avaliacao.compareTo(" ") <= 0){
            avaliacao = "1";
        }
        rs = this.executeQuery(
            "SELECT A.sfid, A.tipo__c, A.descricao__c,"+
                  " A.image_url__c, A.video_url__c,"+
                  " B.id, B.pontuacao__c"+
            " FROM salesforce.instalefacil_avaliacao_modulo__c A" +
                " LEFT JOIN salesforce.instalefacil_instalador_avaliacao__c B"+
                " ON B.instalador__c = '"+this.getUserSFId()+"'"+
                " AND B.modulo__c = A.sfid "+
                " AND B.isdeleted = false"+
            " WHERE A.avaliacao__c = '"+this.escape(avaliacao)+"'"+
            " AND A.isdeleted = false" +
            " ORDER BY A.sequencia__c"
        );
        JSONArray modulos = new JSONArray();
        HashMap<String,Integer> moduloMap = new HashMap<>();
        while (rs.next()){
            String sfid = rs.getString("sfid");
            boolean finalizado = (rs.getString("id") != null);
            moduloMap.put(sfid,modulos.size());
            JSONObject modulo = new JSONObject();
            modulo.put("id", sfid);
            modulo.put("tipo", rs.getString("tipo__c"));
            modulo.put("descricao", rs.getString("descricao__c"));
            modulo.put("image", rs.getString("image_url__c"));
            modulo.put("video", rs.getString("video_url__c"));
            modulo.put("finalizado", finalizado);
            modulo.put("pontuacao", rs.getDouble("pontuacao__c"));
            modulo.put("perguntas", new JSONArray());
            modulos.add(modulo);
        }
        rs = this.executeQuery(
            "SELECT modulo__c, pergunta__c, alternativa_1__c,"+
                  " alternativa_2__c, alternativa_3__c,"+
                  " alternativa_4__c, alternativa_5__c"+
            " FROM salesforce.instalefacil_avaliacao_modulo_pergunta__c"+
            " WHERE modulo__c IN ('"+AppUtils.implode("','",moduloMap.keySet())+"')"+
            " AND isdeleted = false"+
            " ORDER BY modulo__c, sequencia__c"
        );
        while (rs.next()){
            String sfid = rs.getString("modulo__c");
            if (moduloMap.containsKey(sfid)){
                JSONObject pergunta = new JSONObject();
                pergunta.put("pergunta", rs.getString("pergunta__c"));
                pergunta.put("alternativa1", rs.getString("alternativa_1__c"));
                pergunta.put("alternativa2", rs.getString("alternativa_2__c"));
                pergunta.put("alternativa3", rs.getString("alternativa_3__c"));
                pergunta.put("alternativa4", rs.getString("alternativa_4__c"));
                pergunta.put("alternativa5", rs.getString("alternativa_5__c"));
                JSONArray perguntas = (JSONArray) ((JSONObject) modulos
                                        .get(moduloMap.get(sfid)))
                                        .get("perguntas");
                perguntas.add(pergunta);
            }
        }
        JSONObject returnData = new JSONObject();
        returnData.put("avaliacao", avaliacao);
        returnData.put("modulos", modulos);
        return returnData;
    }

}
