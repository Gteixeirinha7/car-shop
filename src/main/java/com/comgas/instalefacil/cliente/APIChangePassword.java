
package com.comgas.instalefacil.cliente;

import com.comgas.instalefacil.core.AppConnection;
import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.core.AppUtils;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;

@WebServlet("/cliente/api/change-password")
public class APIChangePassword extends HttpServlet {

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
            security.refreshSession(
                    request.getHeader("Session-id"), 
                    request.getHeader("Access-token")
            );
            JSONObject inputData = AppUtils.parseRequest(request);
            if(!inputData.containsKey("oldPassword") || !inputData.containsKey("newPassword")){
                throw new AppException(400, "Parâmetros Inválidos");
            }
            String oldPassword = inputData.get("oldPassword").toString();
            String newPassword = inputData.get("newPassword").toString();
            response.getWriter().append(
                security.changePassword(oldPassword,newPassword).toString()
            );
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
