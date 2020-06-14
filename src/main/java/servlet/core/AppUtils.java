package servlet.core;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import javax.servlet.http.HttpServletRequest;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

public class AppUtils {
    
    public static int rand(int min, int max) {
        return Integer.valueOf( (int) (min + Math.round(Math.random() * (max-min))));
    }


    public static int rand(int max){ return rand(0,max); }
    public static int rand(){ return rand(0,2147483647); }


    public static double round(double value, int precision){
        if (precision > 0){
            double scale = Math.pow(10, Double.valueOf(precision));
            return Math.round(value * scale) / scale;
        }
        return Math.round(value);
    }


    public static long round(double value){ return Long.valueOf( Math.round(value)); }


    public static String substr(String string, int index, int length) {
        return string.substring(index, index+length);
    }


    public static String replace(String[] regexs, String[] replacements, String string) {
        if (string != null && regexs != null && replacements != null){
            int n = Math.min(regexs.length, replacements.length);
            for(int i=0; i < n; i++){
                    string = string.replaceAll(regexs[i],replacements[i]);
            }
        }
        return string;
    }


    public static String addSlashes(String string) {
        return string.replaceAll("\\\\", "\\\\\\\\")
            .replaceAll("\\t", "\\\\t")
            .replaceAll("\\r", "\\\\r")
            .replaceAll("\\n", "\\\\n")
            .replaceAll("\\f", "\\\\f")
            .replaceAll("\\00", "\\\\0")
            .replaceAll("'", "\\\\'")
            .replaceAll("\"", "\\\\\"");
    }
    
    public static String dbEscape(String string){
        return string.replaceAll("'", "''");
    }


	public static ArrayList<String> explode(String regex, String string) {
		ArrayList<String> a;
		if (string != null){
			if (regex != null && !regex.isEmpty()){
				a = new ArrayList<String>( Arrays.asList(string.split(regex,-1)) );
			}else{
				a = new ArrayList<String>();
				a.add(string);
			}
		}else{
			a = new ArrayList<String>();
		}
		return a;
	}


	public static String implode(String separator, ArrayList<?> array) {
		String s = new String();
		int n;
		if (array != null && (n = array.size()) > 0){
			s = s.concat(array.get(0).toString());
			for (int i=1; i < n; i++){
				s = s.concat(separator);
				s = s.concat(array.get(i).toString());
			}
		}
		return s;
	}


	public static String implode(String separator, Set<?> set) {
		String s = new String();
		int i = 0;
		for(Object item : set){
			if (i++ > 0) s = s.concat(separator);
			s = s.concat(item.toString());
		}
		return s;
	}


	public static String implode(String separator, String[] array) {
		String s = new String();
		int n;
		if (array != null && (n = array.length) > 0){
			s = s.concat(array[0]);
			for (int i=1; i < n; i++){
				s = s.concat(separator);
				s = s.concat(array[i]);
			}
		}
		return s;
	}


	public static long time(){ return System.currentTimeMillis() / 1000; }


	public static String getCurrentTime() {
		return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
	}

	public static String getCurrentDate() {
		return new SimpleDateFormat("yyyy-MM-dd").format(new Date());
	}


	public static int daysBetween(String fromDate, String toDate) throws AppException{
		try {
			DateFormat yyyymmdd = new SimpleDateFormat("yyyy-MM-dd");
			Date fromDt = yyyymmdd.parse(fromDate);
			Date toDt = yyyymmdd.parse(toDate);
			long milliseconds = toDt.getTime() - fromDt.getTime();
			return (int) (milliseconds / 86400000L);
		} catch (ParseException e) {
			throw new AppException("Invalid Date","NeUtils.daysBetween");
		}
	}


	public static boolean isNumeric(String value) { return value.matches("-?\\d+(\\.\\d+)?"); }

	public static boolean boolVal(String value) { return  Boolean.valueOf(value); }

	public static void sleep(int miliseconds){
		try{
			Thread.sleep(miliseconds);
		}catch(InterruptedException e) { }catch(IllegalArgumentException e){}
	}


	public static String md5(String string){
		try{
			MessageDigest md5 = MessageDigest.getInstance("MD5");
			byte[] hash = md5.digest(string.getBytes());
			char[] hexChars = new char[hash.length * 2];
			char[] hexArray = "0123456789abcdef".toCharArray();
			for (int i = 0; i < hash.length; i++ ) {
				int value = hash[i] & 0xFF;
				hexChars[i * 2] = hexArray[value >>> 4];
				hexChars[i * 2 + 1] = hexArray[value & 0x0F];
			}
			return new String(hexChars);

		}catch(NoSuchAlgorithmException e){return "";}
	}


	public static Object unserialize(byte[] serializedObject) throws AppException {
		try{
			ByteArrayInputStream byteInputStream = new ByteArrayInputStream(serializedObject);
			ObjectInputStream objectInputStream = new ObjectInputStream(byteInputStream);
			return objectInputStream.readObject();
		}catch(IOException e){
			throw new AppException(e.getMessage(),"NeUtils.unserialize");
		}catch(ClassNotFoundException e){
			throw new AppException(e.getMessage(),"NeUtils.unserialize");
		}
	}


	public static byte[] serialize(Object object) throws AppException {
		try{
			ByteArrayOutputStream byteOutStream = new ByteArrayOutputStream();
			ObjectOutputStream objectOutStream = new ObjectOutputStream(byteOutStream);
			objectOutStream.writeObject(object);
			objectOutStream.flush();
			return byteOutStream.toByteArray();
		}catch(IOException e){
			throw new AppException(e.getMessage(),"NeUtils.serialize");
		}
	}


	public static String compress(String string) throws AppException {
		if (string == null || string.length() == 0) {
			return string;
		}
		try {
			ByteArrayOutputStream obj = new ByteArrayOutputStream();
			GZIPOutputStream gzipOutputStream = new GZIPOutputStream(obj);
			gzipOutputStream.write(string.getBytes("UTF-8"));
			gzipOutputStream.close();
			return obj.toString("UTF-8");
		} catch (IOException e) {
			throw new AppException(e.getMessage(),"NeUtils.compress");
		}
	}


	public static String decompress(String string) throws Exception {
		if (string == null || string.length() == 0) {
			return string;
		}
		try{
			GZIPInputStream gzipInputStream = new GZIPInputStream(new ByteArrayInputStream(string.getBytes("UTF-8")));
			BufferedReader buffer = new BufferedReader(new InputStreamReader(gzipInputStream,"UTF-8"));
			String outStr = "";
			String line;
			while ((line = buffer.readLine()) != null) {
				outStr += line;
			}
			return outStr;
		} catch (IOException e) {
			throw new AppException(e.getMessage(),"NeUtils.compress");
		}
	}

	public static File zip(List<File> files, String filename) {
		File zipfile = new File(filename);
		byte[] buf = new byte[1024];
		try {
			ZipOutputStream out = new ZipOutputStream(new FileOutputStream(zipfile));
			for(int i=0; i<files.size(); i++) {
				FileInputStream in = new FileInputStream(files.get(i).getCanonicalPath());
				out.putNextEntry(new ZipEntry(files.get(i).getName()));
				int len;
				while((len = in.read(buf)) > 0) {
					out.write(buf, 0, len);
				}
				out.closeEntry();
				in.close();
			}
			out.close();
			return zipfile;
		} catch (IOException ex) {
			System.err.println(ex.getMessage());
		}
		return null;
	}
    
    
    public static JSONObject parseRequest(HttpServletRequest request) throws AppException{
        StringBuffer jb = new StringBuffer();
        String line = null;
        try {
            BufferedReader reader = request.getReader();
            while ((line = reader.readLine()) != null){
                jb.append(line);
            }
        } catch (Exception e) {
            throw new AppException("Invalid Data", "AppUtils.parseRequest");
        }
            
        try {
            JSONParser parser = new JSONParser();
            String body = jb.toString();
            if (body.length() > 0) return (JSONObject) parser.parse(body);
            return new JSONObject();
        } catch (Exception e) {
            throw new AppException("Invalid JSON Data", "AppUtils.parseRequest");
        }
        
    }

    public static boolean isEmailValid(String email) { 
	return email.matches("^[_a-z0-9-]+(\\.[_a-z0-9-]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,3})$");
    }

    public static String toPhoneNumber(String source) {
        source = source.replaceAll("[^0-9]", "");
        int size = source.length();
        if (size > 11){
            return null;
        }else if (size > 9){
            return "("+source.substring(0,2)+")"+source.substring(2,size-4)+"-"+source.substring(size-4);
        }
        //else if (size > 7){
        //    return source.substring(0,size-4)+"-"+source.substring(size-4);
        //}
        return null;
    }

    public static String toCNPJ(String source) {
        source = source.replaceAll("[^0-9]", "");
        int size = source.length();
        if (size > 14){
            return null;
        }else if (size > 12){
            if (size == 13) source = "0"+source;
            return source.substring(0,2)+"."+source.substring(2,5)+
                    "."+source.substring(5,8)+"/"+source.substring(8,12)+
                    "-"+source.substring(12,14);
        }
        return null;
    }

    public static String toCPF(String source) {
        source = source.replaceAll("[^0-9]", "");
        int size = source.length();
        if (size == 11){
            return source.substring(0,3)
                    +"."+source.substring(3,6)
                    +"."+source.substring(6,9)
                    +"-"+source.substring(9);
        }
        return null;
    }

    public static String toCEP(String source) {
        source = source.replaceAll("[^0-9]", "");
        int size = source.length();
        if (size == 8){
            return source.substring(0,5)+"-"+source.substring(5);
        }
        return null;
    }

	public static String toUUID(String id) {
        String hash = AppUtils.md5(id+String.valueOf(AppUtils.rand())+String.valueOf(AppUtils.time()));
        return hash.substring(0,8)
                +"-"+hash.substring(8,12)
                +"-"+hash.substring(12,16)
                +"-"+hash.substring(16,20)
                +"-"+hash.substring(20);
	}
    public static String toUUID(long id) {
        String hash = AppUtils.md5(String.valueOf(id)+String.valueOf(AppUtils.rand())+String.valueOf(AppUtils.time()));
        return hash.substring(0,8)
                +"-"+hash.substring(8,12)
                +"-"+hash.substring(12,16)
                +"-"+hash.substring(16,20)
                +"-"+hash.substring(20);
    }
}
