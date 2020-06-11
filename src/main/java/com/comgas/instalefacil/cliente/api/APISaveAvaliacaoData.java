package com.comgas.instalefacil.cliente.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.cliente.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONObject;

@WebServlet("/cliente/api/save-avaliacao-data")
public class APISaveAvaliacaoData extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        if(!inputData.containsKey("id") || !inputData.containsKey("pontuacao")){
            throw new AppException("Invalid Parameters", "APISaveAvaliacaoData.execute");
        }
        Long id = Long.valueOf(inputData.get("id").toString());
        ResultSet rs = this.executeQuery(
            "SELECT A.instalador__c, A.status__c,"+
                " B.id AS instaladorId, B.elogio_transparencia_qtd__c,"+
                " B.elogio_pontualidade_qtd__c, B.elogio_organizacao_qtd__c,"+
                " B.elogio_conhecimento_qtd__c, B.elogio_atendimento_qtd__c"+
            " FROM salesforce.instalefacil_projeto__c A"+
               ", salesforce.instalefacil_instalador__c B"+
            " WHERE A.id = "+id+
            " AND A.cliente__c = '"+this.getUserSFId()+"'"+
            " AND A.isdeleted = false"+
            " AND B.sfid = A.instalador__c"+
            " AND B.isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load project", "APISaveAvaliacaoData.execute");
        }
        String status = rs.getString("status__c");
        if (status.equals("5A")){
            Long instaladorId = rs.getLong("instaladorId");
            Integer elogioTransparenciaQtd = (int) rs.getDouble("elogio_transparencia_qtd__c");
            Integer elogioPontualidadeQtd = (int) rs.getDouble("elogio_pontualidade_qtd__c");
            Integer elogioOrganizacaoQtd = (int) rs.getDouble("elogio_organizacao_qtd__c");
            Integer elogioConhecimentoQtd = (int) rs.getDouble("elogio_conhecimento_qtd__c");
            Integer elogioAtendimentoQtd = (int) rs.getDouble("elogio_atendimento_qtd__c");

            Double pontuacao = Double.valueOf(inputData.get("pontuacao").toString());
            Boolean elogioTransparencia = (inputData.containsKey("elogioTransparencia")
                ? Boolean.valueOf(inputData.get("elogioTransparencia").toString()) : false);
            Boolean elogioPontualidade = (inputData.containsKey("elogioPontualidade")
                ? Boolean.valueOf(inputData.get("elogioPontualidade").toString()) : false);
            Boolean elogioOrganizacao = (inputData.containsKey("elogioOrganizacao")
                ? Boolean.valueOf(inputData.get("elogioOrganizacao").toString()) : false);
            Boolean elogioConhecimento = (inputData.containsKey("elogioConhecimento")
                ? Boolean.valueOf(inputData.get("elogioConhecimento").toString()) : false);
            Boolean elogioAtendimento = (inputData.containsKey("elogioAtendimento")
                ? Boolean.valueOf(inputData.get("elogioAtendimento").toString()) : false);
            Boolean reclamacaoDesorganizacao = (inputData.containsKey("reclamacaoDesorganizacao")
                ? Boolean.valueOf(inputData.get("reclamacaoDesorganizacao").toString()) : false);
            Boolean reclamacaoConhecimento = (inputData.containsKey("reclamacaoConhecimento")
                ? Boolean.valueOf(inputData.get("reclamacaoConhecimento").toString()) : false);
            Boolean reclamacaoAtraso = (inputData.containsKey("reclamacaoAtraso")
                ? Boolean.valueOf(inputData.get("reclamacaoAtraso").toString()) : false);
            Boolean reclamacaoAtendimento = (inputData.containsKey("reclamacaoAtendimento")
                ? Boolean.valueOf(inputData.get("reclamacaoAtendimento").toString()) : false);
            String comentario = (inputData.containsKey("comentario")
                ? (String) inputData.get("comentario") : null);

            if (elogioTransparencia) elogioTransparenciaQtd++;
            if (elogioPontualidade) elogioPontualidadeQtd++;
            if (elogioOrganizacao) elogioOrganizacaoQtd++;
            if (elogioConhecimento) elogioConhecimentoQtd++;
            if (elogioAtendimento) elogioAtendimentoQtd++;
            
            status = "9A";
            this.executeSQL(
                "UPDATE salesforce.instalefacil_projeto__c " +
                " SET pontuacao_cliente__c = "+pontuacao+
                   ", elogio_transparencia__c = "+elogioTransparencia+
                   ", elogio_pontualidade__c = "+elogioPontualidade+
                   ", elogio_organizacao__c = "+elogioOrganizacao+
                   ", elogio_conhecimento__c = "+elogioConhecimento+
                   ", elogio_atendimento__c = "+elogioAtendimento+
                   ", reclamacao_desorganizacao__c = "+reclamacaoDesorganizacao+
                   ", reclamacao_conhecimento__c = "+reclamacaoConhecimento+
                   ", reclamacao_atraso__c = "+reclamacaoAtraso+
                   ", reclamacao_atendimento__c = "+reclamacaoAtendimento+
                   ", avaliacaooutros__c = '"+this.escape(comentario)+"'"+
                   ", avaliacao_dt__c = now()"+
                   ", status__c = '"+this.escape(status)+"'"+
                " WHERE id = "+id
            );
            this.executeSQL(
                "UPDATE salesforce.instalefacil_instalador__c " +
                " SET elogio_transparencia_qtd__c = "+elogioTransparenciaQtd+
                   ", elogio_pontualidade_qtd__c = "+elogioPontualidadeQtd+
                   ", elogio_organizacao_qtd__c = "+elogioOrganizacaoQtd+
                   ", elogio_conhecimento_qtd__c = "+elogioConhecimentoQtd+
                   ", elogio_atendimento_qtd__c = "+elogioAtendimentoQtd+
                " WHERE id = "+instaladorId
            );
        }
        JSONObject returnData = new JSONObject();
        returnData.put("status", status);
        return returnData;
    }

}
