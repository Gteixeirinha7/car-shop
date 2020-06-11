package com.comgas.instalefacil.cliente;

import com.comgas.instalefacil.core.AppConnection;
import com.comgas.instalefacil.core.AppUtils;
import com.comgas.instalefacil.core.AppException;
import java.io.IOException;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;

public class APIFileHandler extends HttpServlet {
    
    private AccessControl security;
    private AppConnection conn;

    //for Preflight
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        setAccessControlHeaders(response);
        response.setStatus(HttpServletResponse.SC_OK);
    }

    private void setAccessControlHeaders(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers",
                "Content-Type, "+
                "Session-id, "+
                "Access-token, "+
                "Data-id, "+
                "Data-tipo, "+
                "Data-foto-id"
        );
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doPost(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        this.conn = null;
        try{
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json");
            setAccessControlHeaders(response);
            this.conn = new AppConnection();
            this.security = new AccessControl(this.conn);
            security.refreshSession(
                request.getHeader("Session-id"), 
                request.getHeader("Access-token")
            );
            try{
                response.getWriter().append(execute(request).toString());
            }catch (SQLException e){
                throw new AppException(e.getMessage(), "APIHandler.execute");
            }
        }catch(AppException e){
            JSONObject responseError = new JSONObject();
            if(e.getErrorCode() == 999){
                e.printStackTrace();
                responseError.put("error", e.getErrorCode());
                responseError.put("message", "Erro Interno");
                responseError.put("description", e.getMessage());
                responseError.put("source", e.getCategory());
            }else{
                responseError.put("error", e.getErrorCode());
                responseError.put("message", e.getMessage());
            }
            response.getWriter().append(responseError.toJSONString());
        }finally{
            if (this.conn != null) this.conn.close();
        }
    }

    public Long getSessionId(){
        return this.security.getSessionId();
    }

    public Long getUserId(){
        return this.security.getUserId();
    }

    public String getUserSFId(){
        return this.security.getUserSFId();
    }

    public String getAccessToken(){
        return this.security.getAccessToken();
    }

    public JSONObject execute(HttpServletRequest request) throws AppException, SQLException {
        return new JSONObject();
    }

    public String escape(String value) {
        return this.conn.escape(value,0); 
    }

    public String escape(String value, int maxLength) {
        return this.conn.escape(value, maxLength); 
    }

    public long getNextId(String seqName) throws AppException {
        return this.conn.getNextId(seqName);
    }

    public String getNextIdClause(String seqName) {
        return this.conn.getNextIdClause(seqName);
    }

    public String getUUIDClause(long id) {
        return this.conn.getUUIDClause(id);
    }

    public String getUUIDClause() {
        return this.conn.getUUIDClause(0);
    }

    public void ping() throws AppException {
        this.conn.ping();
    }

    public ResultSet executeQuery(String query) throws AppException {
        return this.conn.executeQuery(query); 
    }

    public int executeSQL(String query) throws AppException {
        return this.conn.executeSQL(query);
    }

    public PreparedStatement prepareStatement(String query) throws AppException {
        return this.conn.prepareStatement(query);
    }

    public PreparedStatement getInsertStatement(String tableName, String fields) throws AppException {
        return this.conn.getInsertStatement(tableName, fields);
    }

    public void createAction(String actionTag, String actionURI, 
                              String instalador, String cliente, String projeto)
            throws AppException {

        instalador = (instalador == null ? "null" : "'"+this.conn.escape(instalador)+"'");
        cliente = (cliente == null ? "null" : "'"+this.conn.escape(cliente)+"'");
        projeto = (projeto == null ? "null" : "'"+this.conn.escape(projeto)+"'");
        long actionId = this.conn.getNextId("salesforce.instalefacil_action__c_id_seq");
        String externalId = AppUtils.toUUID(actionId);
        String actionToken = AppUtils.md5(actionTag+instalador+cliente+projeto+actionId+this.getUserId()+AppUtils.time());
        String url = System.getenv("BASE_URL")+actionURI
                        + (actionURI.matches("[?]") ? "&" : "?")
                        + "id="+externalId+"&token="+actionToken;
        Long timestamp = AppUtils.time();
        this.conn.executeSQL(
            "INSERT INTO salesforce.instalefacil_action__c" +
            " (id, externalid__c, token__c, action__c,"+
              " actionuri__c, instalador__c, cliente__c, projeto__c,"+
              " timestamp__c, createddate, isdeleted)" +
            " VALUES ("+actionId+",'"+externalId+"','"+actionToken+"','"+this.conn.escape(actionTag)+
                    "','"+this.conn.escape(url)+"',"+instalador+","+cliente+","+projeto+
                    ","+timestamp+",now()"+",false)"
        );
    }
}