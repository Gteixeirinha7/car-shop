package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.core.AppUtils;
import com.comgas.instalefacil.instalador.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/save-qualificacao-data")
public class APISaveQualificacaoData extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        if(!inputData.containsKey("avaliacao")
            || !inputData.containsKey("modulo")
                || !inputData.containsKey("respostas")){
            throw new AppException("Invalid Parameters", "APISaveQualificacaoData.execute");
        }
        long userId = this.getUserId();
        ResultSet rs = this.executeQuery(
            "SELECT A.status_ativacao__c, A.status__c,"+
                  " A.avaliacao__c, B.nota_minima__c"+
            " FROM salesforce.instalefacil_instalador__c A"+
                    " LEFT JOIN salesforce.instalefacil_parametros__c B"+
                        " ON B.name = 'Parâmetros Instalador'"+
            " WHERE A.id = " + userId +
            " AND A.isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load user data", "APISaveQualificacaoData.execute");
        }
        String ativacao = rs.getString("status_ativacao__c");
        String status = rs.getString("status__c");
        if (ativacao.compareTo("2A") < 0){
            throw new AppException(500,"Dados incompletos");
        }
        Double notaMinima = rs.getDouble("nota_minima__c");
        String avaliacao = inputData.get("avaliacao").toString();
        String modulo = inputData.get("modulo").toString();
        ArrayList<String> respostas = new ArrayList<>();
        JSONArray r = (JSONArray) inputData.get("respostas");
        for(int i=0; i < r.size(); i++){
            respostas.add(r.get(i).toString());
        }
        boolean finalizado = false;
        Double pontuacaoInicial = null;
        if (avaliacao.equals(rs.getString("avaliacao__c"))){
            rs = this.executeQuery(
                "SELECT alternativa_correta__c, pontuacao__c" +
                " FROM salesforce.instalefacil_avaliacao_modulo_pergunta__c " +
                " WHERE modulo__c = '"+this.escape(modulo)+"'"+
                " AND isdeleted = false"+
                " ORDER BY sequencia__c"
            );
            int i = 0;
            int n = respostas.size();
            finalizado = true;
            Double pontuacao = 0.00D;
            while(rs.next()){
                if (i < n){
                    if (respostas.get(i).equals(rs.getString("alternativa_correta__c"))){
                        pontuacao += rs.getDouble("pontuacao__c");
                    }
                }else{
                    finalizado = false;
                }
                i++;
            }
            if (finalizado){
                this.executeSQL(
                    "DELETE FROM salesforce.instalefacil_instalador_avaliacao__c "+
                    " WHERE instalador__c = '"+this.getUserSFId()+"'"+
                    " AND modulo__c = '"+this.escape(modulo)+"'"
                );
                long id = this.getNextId("salesforce.instalefacil_instalador_avaliacao__c_id_seq");
                String externalId = AppUtils.toUUID(id);
                this.executeSQL(
                    "INSERT INTO salesforce.instalefacil_instalador_avaliacao__c"+
                    " (id, externalid__c, instalador__c, modulo__c,"+
                        " pontuacao__c, isdeleted)"+
                    " VALUES ("+id+
                            ",'"+externalId+
                            "','"+this.getUserSFId()+
                            "','"+this.escape(modulo)+
                            "',"+pontuacao+
                            ",false)"
                );
                rs = this.executeQuery(
                    "SELECT B.id, B.pontuacao__c"+
                    " FROM salesforce.instalefacil_avaliacao_modulo__c A" +
                        " LEFT JOIN salesforce.instalefacil_instalador_avaliacao__c B"+
                        " ON B.instalador__c = '"+this.getUserSFId()+"'"+
                        " AND B.modulo__c = A.sfid "+
                        " AND B.isdeleted = false"+
                    " WHERE A.avaliacao__c = '"+this.escape(avaliacao)+"'"+
                    " AND A.isdeleted = false" +
                    " ORDER BY A.sequencia__c"
                );
                pontuacaoInicial = 0.00D;
                boolean avaliacaoFinalizada = true;
                n = 0;
                while (rs.next()){
                    if (rs.getString("id") != null){
                        pontuacaoInicial += rs.getDouble("pontuacao__c");
                    }else{
                        avaliacaoFinalizada = false;
                    }
                    n++;
                }
                if (avaliacaoFinalizada && n > 0){
                    pontuacaoInicial = pontuacaoInicial / n;
                    if (pontuacaoInicial > 5.00D) pontuacaoInicial = 5.00D;
                    if (ativacao.equals("2A")){
                        if (pontuacaoInicial >= notaMinima){
                            ativacao = "9X";
                            if (status.equals("Inativo")){
                                status = "Ativo";
                            }
                        }else{
                            ativacao = "2X";
                        }
                    }
                    this.executeSQL(
                        "UPDATE salesforce.instalefacil_instalador__c " +
                        " SET pontuacao_inicial__c = "+pontuacaoInicial+
                           ", pontuacao_media__c = "+pontuacaoInicial+
                           ", status_ativacao__c = '"+this.escape(ativacao)+"'"+
                           ", status__c = '"+this.escape(status)+"'"+
                        " WHERE id = "+userId
                    );
                }
            }
        }
        JSONObject returnData = new JSONObject();
        returnData.put("avaliacao", avaliacao);
        returnData.put("modulo",    modulo);
        returnData.put("finalizado",finalizado);
        returnData.put("pontuacaoInicial", pontuacaoInicial);
        returnData.put("ativacao",  ativacao);
        returnData.put("status",    status);
        return returnData;
    }

}
