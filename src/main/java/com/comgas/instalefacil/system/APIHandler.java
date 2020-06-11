package com.comgas.instalefacil.system;

import com.comgas.instalefacil.core.AppConnection;
import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.core.AppUtils;
import java.io.IOException;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;

public class APIHandler extends HttpServlet {

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
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
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
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        setAccessControlHeaders(response);
        try{
            this.conn = new AppConnection();
            JSONObject inputData = AppUtils.parseRequest(request);
            if(!inputData.containsKey("key")) {
                throw new AppException(400, "Parâmetros Inválidos");
            }
            String secretKey = inputData.get("key").toString();
            if (!secretKey.equals(System.getenv("API_SECRET_KEY"))){
                throw new AppException(401, "Parâmetros Inválidos");
            }
            try{
                response.getWriter().append(execute(inputData).toString());
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

    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {
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

}