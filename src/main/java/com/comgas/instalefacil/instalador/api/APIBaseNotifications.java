package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.core.AppUtils;
import com.comgas.instalefacil.instalador.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

public class APIBaseNotifications extends APIHandler {

    public void checkExpiredActions() throws AppException, SQLException {
        String sfid = this.getUserSFId();
        ArrayList<Long> actionListToMark = new ArrayList<>();
        ResultSet rs = this.executeQuery(
            "SELECT B.id, B.action__c,"+
                  " A.status__c AS status_orcamento,"+
                  " C.status__c AS status_projeto"+
            " FROM salesforce.instalefacil_orcamento__c A"+
                    " JOIN salesforce.instalefacil_projeto__c C"+
                        " ON C.sfid = A.projeto__c"+
                        " AND C.isdeleted = false"+
                ", salesforce.instalefacil_action__c B"+
            " WHERE A.instalador__c = '"+sfid+"'"+
            " AND A.isdeleted = false"+
            " AND B.orcamento__c = A.sfid"+
            " AND B.instalador__c = '"+sfid+"'"+
            " AND B.action__c NOT IN ('CreatePassword','ConstructionTips','ResetPassword','EmailChecked')"+
            " AND B.visualizado__c = false"
        );
        while(rs.next()){
            Long actionId = rs.getLong("id");
            String actionType = rs.getString("action__c");
            String statusProjeto = rs.getString("status_projeto");
            String statusOrcamento = rs.getString("status_orcamento");
            if (statusOrcamento.equals("9D") || statusOrcamento.equals("9X")){
                actionListToMark.add( actionId );
            }else{
                switch(actionType){
                case "QuotationReceived":
                    if (!statusOrcamento.equals("2A")){
                        actionListToMark.add( actionId );
                    } break;
                case "PhotoPending":
                    if (!statusProjeto.equals("3A")){
                        actionListToMark.add( actionId );
                    } break;
                case "GasOnPending":
                    if (!statusProjeto.equals("4B")){
                        actionListToMark.add( actionId );
                    } break;
                case "PhotoReproved":
                    if (!statusProjeto.equals("3D")){
                        actionListToMark.add( actionId );
                    } break;
                case "EvaluationPending":
                    if (!statusProjeto.equals("5A")){
                        actionListToMark.add( actionId );
                    } break;
                case "QuotationPending":
                    if (!statusProjeto.equals("2A")){
                        actionListToMark.add( actionId );
                    } break;
                case "QuotationChanged":
                    if (!statusProjeto.equals("2A")){
                        actionListToMark.add( actionId );
                    } break;
                case "PhotoAprovalPending":
                    if (!statusProjeto.equals("3B")){
                        actionListToMark.add( actionId );
                    } break;
                case "GasOnReproved":
                    if (!statusProjeto.equals("4D")){
                        actionListToMark.add( actionId );
                    } break;
                case "QuotationApproved":
                    if (!statusOrcamento.equals("9A")){
                        actionListToMark.add( actionId );
                    } break;
                }
            }
        }
        if (actionListToMark.size() > 0){
            this.executeSQL(
                "UPDATE salesforce.instalefacil_action__c "+
                " SET visualizado__c = true"+
                " WHERE id IN ("+AppUtils.implode(",",actionListToMark)+")"+
                " AND instalador__c = '"+sfid+"'"
            );            
        }
    }

}
