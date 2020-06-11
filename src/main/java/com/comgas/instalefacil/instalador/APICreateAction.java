package com.comgas.instalefacil.instalador;

import com.comgas.instalefacil.core.AppConnection;
import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.core.AppUtils;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/create-action")
public class APICreateAction extends HttpServlet {

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
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Session-id, Access-token");
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doPost(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        AppConnection conn = null;
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        setAccessControlHeaders(response);
        try{
            conn = new AppConnection();
            AccessControl security = new AccessControl(conn);
            JSONObject inputData = AppUtils.parseRequest(request);
            try{
                response.getWriter().append(
                    security.createActionFromAPI(inputData).toString()
                );
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
            if (conn != null) conn.close();
        }
    }
}