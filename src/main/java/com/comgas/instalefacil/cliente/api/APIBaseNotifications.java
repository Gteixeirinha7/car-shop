package com.comgas.instalefacil.cliente.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.cliente.APIHandler;
import com.comgas.instalefacil.core.AppUtils;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

public class APIBaseNotifications extends APIHandler{

    public void checkExpiredActions(Long id) throws AppException, SQLException {
        String sfid = this.getUserSFId();
        ResultSet rs = this.executeQuery(
            "SELECT C.id, C.action__c,"+
                  " A.status__c AS status_projeto,"+
                  " B.status__c AS status_orcamento "+
            " FROM salesforce.instalefacil_projeto__c A"+
                ", salesforce.instalefacil_action__c C"+
                ", salesforce.instalefacil_orcamento__c B"+
            " WHERE A.id = "+id+
            " AND A.cliente__c = '"+sfid+"'"+
            " AND A.isdeleted = false"+
            " AND C.projeto__c = A.sfid"+
            " AND C.cliente__c = '"+sfid+"'"+
            " AND C.action__c NOT IN ('CreatePassword','ConstructionTips','ResetPassword','EmailChecked')"+
            " AND C.visualizado__c = false"+
            " AND B.sfid = C.orcamento__c"+
            " AND B.projeto__c = A.sfid"+
            " AND B.isdeleted = false"
        );
        ArrayList<Long> actionListToMark = new ArrayList<>();
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
                " AND cliente__c = '"+sfid+"'"
            );            
        }
    }

}
