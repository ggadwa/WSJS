package com.klinksoftware.wsjs.http;

import com.klinksoftware.wsjs.application.*;

import java.util.*;
import java.io.*;
import java.text.*;
import java.net.*;

public class HTTPClient implements Runnable
{
    private static final String[] FILE_EXTENSIONS={"html","css","js","mjs","png","wav","bin","gltf"};
    private static final String[] FILE_MIME_TYPES={"text/html","text/css","text/javascript","text/javascript","image/png","audio/wav","application/octet-stream","model/gltf+json"};
    
    private final App           app;
    private final Socket        socket;
    
    public HTTPClient(App app,Socket socket)
    {
        this.app=app;
        this.socket=socket;
    }
    
        //
        // mime utilities
        //
    
    public String getMimeTypeForFile(String path)
    {
        int         n,idx;
        String      extension;
        
        idx=path.lastIndexOf(".");
        if (idx!=-1) {
            extension=path.substring(idx+1);
            for (n=0;n!=FILE_EXTENSIONS.length;n++) {
                if (FILE_EXTENSIONS[n].equalsIgnoreCase(extension)) return(FILE_MIME_TYPES[n]);
            }
        }
        
        return("text/plain");
    }
    
        //
        // if modified utilities
        //
    
    public String createGMTIfModified(Calendar cal)
    {
        SimpleDateFormat    f;
        StringBuffer        gmtStr;

        gmtStr=new StringBuffer();
        
        f=new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss");
        f.setTimeZone(TimeZone.getTimeZone("GMT"));
        f.format(cal.getTime(),gmtStr,new FieldPosition(0));
        
        return(gmtStr.toString()+" GMT");
    }
    
    public Calendar parseIfModified(String ifModified)
    {
        Calendar            cal;
        SimpleDateFormat    f;
        
        f=new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss");
        f.setTimeZone(TimeZone.getTimeZone("GMT"));
        
        cal=Calendar.getInstance();
        cal.setTime(f.parse(ifModified,new ParsePosition(0)));
        
        return(cal);
    }
    
        //
        // read the http request
        //
    
    private HTTPRequestData read() throws Exception
    {
        int                     sz,idx,idx2,
                                contentOffset,contentLen;
        byte[]                  requestBytes;
        String                  requestStr;
        InputStream             inStream;
        ByteArrayOutputStream   outStream;
        HTTPRequestData         requestData;
        
        requestData=new HTTPRequestData();
        
            // read http request until \r\n\r\n is reached
            // or we error out
            
        requestStr=null;
        requestBytes=new byte[1024];
        
        inStream=socket.getInputStream();
        outStream=new ByteArrayOutputStream(1024);
        
        contentOffset=0;
        contentLen=-1;
        
        while (true) {
            sz=inStream.read(requestBytes,0,1024);
            if (sz<0) {
                requestData.setError(400,"Bad Request");
                return(requestData);
            }
            if (sz==0) break;
            
            outStream.write(requestBytes,0,sz);
                
                // look for ending
                
            if (contentLen==-1) {
                requestStr=new String(outStream.toByteArray(),"ISO-8859-1");
                if (requestStr.contains("\r\n\r\n")) {
                    
                        // if no content-length then we are done
 
                    idx=requestStr.toLowerCase().indexOf("content-length: ");
                    if (idx==-1) break;
                    
                    idx2=requestStr.indexOf("\r\n",idx);
                    if (idx2==-1) break;
                    
                    contentLen=Integer.parseInt(requestStr.substring((idx+16),idx2));
                    contentOffset=requestStr.indexOf("\r\n\r\n")+4;
                }
            }
            else {
                if (outStream.size()>=(contentOffset+contentLen)) break;
            }
        }
        
        if (requestStr==null) {
            requestData.setError(400,"Bad Request");
            return(requestData);
        }
        
            // stats
            
        app.addStatusNetworkBytes(requestStr.length());
        
            // get the request type and address
        
        idx=requestStr.indexOf(' ');
        if (idx!=-1) {
            requestData.method=requestStr.substring(0,idx);
            
            idx++;
            idx2=requestStr.indexOf(' ',idx);
            if (idx2!=-1) requestData.address=requestStr.substring(idx,idx2);
        }
        
        if ((requestData.method==null) || (requestData.address==null)) {
            requestData.setError(400,"Bad Request");
            return(requestData);
        }
        
            // only do gets and puts
            
        if ((!requestData.method.equals("GET") && (!requestData.method.equals("POST")))) {
            requestData.setError(405,"Method Not Allowed");
            return(requestData);
        }
        
            // get if-modified
        
        idx=requestStr.toLowerCase().indexOf("if-modified-since: ");
        if (idx!=-1) {
            idx2=requestStr.indexOf("\r\n",idx);
            if (idx2!=-1) {
                requestData.ifModified=parseIfModified(requestStr.substring((idx+19),idx2));
            }
        }
        
            // post data
            
        if ((requestData.method.equals("POST")) && (contentLen>0)) {
            requestData.postBytes=new byte[contentLen];
            System.arraycopy(outStream.toByteArray(),contentOffset,requestData.postBytes,0,contentLen);
        }
        
            // normalize and decode the file path
            
        try {
            requestData.filePath=(new URI(requestData.address)).normalize().toString();
            requestData.filePath=URLDecoder.decode(requestData.filePath,"UTF-8");
        }
        catch (Exception e)
        {
            requestData.setError(400,"Bad Request");
        }

            // knock off parameters
            // parameters are an error if post
            
        idx=requestData.filePath.indexOf("?");
        if (idx!=-1) {
            if (requestData.method.equals("POST")) requestData.setError(400,"Bad Request");
            return(requestData);
        }
        
        return(requestData);
    }
    
        //
        // write http request
        //
    
    private void writeError(int replyCode,String errorStr) throws Exception
    {
        StringBuilder           strBuild;
        
        strBuild=new StringBuilder(1024);
        
        strBuild.append("HTTP/1.0 ");
        strBuild.append(Integer.toString(replyCode));
        strBuild.append(" ");
        strBuild.append(errorStr);
        strBuild.append("\r\n");
        strBuild.append("Content-Type: text/plain\r\n");
        strBuild.append("Content-Length: ");
        strBuild.append(errorStr.length());
        strBuild.append("\r\n\r\n");
        strBuild.append(errorStr);
        
        socket.getOutputStream().write(strBuild.toString().getBytes());
    }
    
    private void writeFile(HTTPRequestData requestData) throws Exception
    {
        StringBuilder           strBuild;
        OutputStream            out;
        
        out=socket.getOutputStream();
        
            // the header
        
        strBuild=new StringBuilder(1024);
        
        strBuild.append("HTTP/1.0 200 OK\r\n");
        strBuild.append("Server: wsjs\r\n");
        strBuild.append("Date: ");
        strBuild.append(createGMTIfModified(Calendar.getInstance()));
        strBuild.append("\r\n");
        strBuild.append("Content-Type: ");
        strBuild.append(requestData.contentType);
        strBuild.append("\r\n");
        strBuild.append("Content-Length: ");
        strBuild.append(requestData.contentBytes.length);
        strBuild.append("\r\n");
        strBuild.append("Last-Modified: ");
        strBuild.append(createGMTIfModified(requestData.lastModified));
        strBuild.append("\r\n");
        if (requestData.noCache) {
            strBuild.append("Cache-Control: no-cache\r\n");
            strBuild.append("Expires: -1\r\n");

        }
        strBuild.append("\r\n");
        
        out.write(strBuild.toString().getBytes());
        
            // the data
            
        out.write(requestData.contentBytes);
        
            // stats
            
        app.addStatusNetworkBytes(strBuild.length()+requestData.contentBytes.length);
    }
    
    private void writeUpload() throws Exception
    {
        StringBuilder           strBuild;
        OutputStream            out;
        
        out=socket.getOutputStream();
        
            // the header
        
        strBuild=new StringBuilder(1024);
        
        strBuild.append("HTTP/1.0 200 OK\r\n");
        strBuild.append("Server: wsjs\r\n");
        strBuild.append("Date: ");
        strBuild.append(createGMTIfModified(Calendar.getInstance()));
        strBuild.append("\r\n\r\n");
        
        out.write(strBuild.toString().getBytes());
        
            // stats
            
        app.addStatusNetworkBytes(strBuild.length());
    }
    
        //
        // load files
        //
    
    private void loadProjectFile(HTTPRequestData requestData)
    {
        int             fileSize;
        String          filePath;
        File            file;
        FileInputStream inStream;
        
            // get the file path
         
        filePath=app.getWorkingPath()+URLDecoder.decode(requestData.filePath);
        file=new File(filePath);
        
            // not found
            
        if (!file.exists()) {
            requestData.setError(404,"Not Found");
            app.log("HTTP GET 404: "+filePath);
            return;
        }
        
            // directory
            
        if (file.isDirectory()) {
            requestData.setError(403,"Access Forbidden");
            return;
        }
        
            // set last modified and check the if modified
            
        requestData.lastModified=Calendar.getInstance();
        requestData.lastModified.setTimeInMillis(file.lastModified());
        requestData.lastModified.set(Calendar.MILLISECOND,0);
        
        if (requestData.ifModified!=null) {
            if (requestData.lastModified.getTimeInMillis()<=requestData.ifModified.getTimeInMillis()) {
                requestData.setError(304,"Not Modified");
                //app.log("HTTP GET 304: "+filePath);       // don't show 304s
                return;
            }
        }
        
            // load the file
            
        requestData.contentType=getMimeTypeForFile(filePath);
            
        inStream=null;
        
        try {
            fileSize=(int)file.length();
            requestData.contentBytes=new byte[fileSize];

            inStream=new FileInputStream(file);
            inStream.read(requestData.contentBytes);
            inStream.close();
        }
        catch (Exception e)
        {
            requestData.setError(404,"Not Found");
            return;
        }
        finally {
            if (inStream!=null) try { inStream.close(); } catch(IOException e) {}       // will have to be cleaned up during finalize
        }
        
       app.log("HTTP GET 200: "+filePath);
    }
    
    private void loadResourceFile(HTTPRequestData requestData)
    {
        int             fileSize;
        URL             url;
        File            file;
        FileInputStream inStream;
        
            // get the file path within
            // the resources
        
        url=getClass().getResource(requestData.filePath);
        if (url==null) {
            requestData.setError(404,"Not Found");
            app.log("HTTP GET 404: resource:"+requestData.filePath);
            return;
        }
        
        file=new File(url.getFile());
        
            // last modified is start-up time
            
        requestData.lastModified=Calendar.getInstance();
        requestData.lastModified.setTimeInMillis(app.getStartUpTime().getTimeInMillis());
        requestData.lastModified.set(Calendar.MILLISECOND,0);
        
        if (requestData.ifModified!=null) {
            if (requestData.lastModified.getTimeInMillis()<=requestData.ifModified.getTimeInMillis()) {
                requestData.setError(304,"Not Modified");
                //app.log("HTTP GET 304: resource:"+requestData.filePath);       // don't show 304s
                return;
            }
        }
        
            // load the file
            
        requestData.contentType=getMimeTypeForFile(requestData.filePath);
            
        inStream=null;
        
        try {
            fileSize=(int)file.length();
            requestData.contentBytes=new byte[fileSize];

            inStream=new FileInputStream(file);
            inStream.read(requestData.contentBytes);
            inStream.close();
        }
        catch (Exception e)
        {
            requestData.setError(404,"Not Found");
            return;
        }
        finally {
            if (inStream!=null) try { inStream.close(); } catch(IOException e) {}       // will have to be cleaned up during finalize
        }
        
       app.log("HTTP GET 200: resource:"+requestData.filePath);
    }
    
    private void loadFavIconFile(HTTPRequestData requestData)
    {
        int             fileSize;
        File            file;
        FileInputStream inStream;
        
            // get the file path within
            // the resources
            
        file=new File(getClass().getResource("/graphics/icon.png").getFile());
        
            // last modified is start-up time
            
        requestData.lastModified=Calendar.getInstance();
        requestData.lastModified.setTimeInMillis(app.getStartUpTime().getTimeInMillis());
        requestData.lastModified.set(Calendar.MILLISECOND,0);
        
            // load the file
            
        requestData.contentType="image/png";
            
        inStream=null;
        
        try {
            fileSize=(int)file.length();
            requestData.contentBytes=new byte[fileSize];

            inStream=new FileInputStream(file);
            inStream.read(requestData.contentBytes);
            inStream.close();
        }
        catch (Exception e)
        {
            requestData.setError(404,"Not Found");
            return;
        }
        finally {
            if (inStream!=null) try { inStream.close(); } catch(IOException e) {}       // will have to be cleaned up during finalize
        }
        
       app.log("HTTP GET 200: /favicon.ico");
    }
    
        //
        // upload file
        //
    
    private void uploadFile(HTTPRequestData requestData)
    {
        HTTPUpload          upload;
        
            // run the upload
            
        upload=new HTTPUpload(app,requestData.filePath,requestData.postBytes);
        
        try {
            upload.run();
        }
        catch (Exception e)
        {
            try { writeError(500,"Internal Server Error"); } catch(Exception e2) {}
            return;
        }
        
        app.log("Upload: "+requestData.filePath+" ("+requestData.postBytes.length+" bytes)");
    }
    
        // this is a simple webserver, meant just to server
        // files for a WSJS game, so it only does specific operations

    @Override
    public void run()
    {
        HTTPRequestData     requestData;
        
        try {
            
                // get the request
                
            requestData=read();
            if (requestData.replyCode!=200) {
                writeError(requestData.replyCode,requestData.errorStr);
                return;
            }
            
                // uploads (POST)
                
            if (requestData.method.equals("POST")) {
                uploadFile(requestData);
                if (requestData.replyCode!=200) {
                    app.log("HTTP Error: "+requestData.replyCode+" "+requestData.errorStr);
                    writeError(requestData.replyCode,requestData.errorStr);
                }
                writeUpload();
                return;
            }
            
                // files (GET)
                // two locations, /projects/ = from projects directory
                // /code/ = from resources
                // one special location for favicon.ico
                // everything else is 403
                
            if (requestData.filePath.startsWith("/projects/")) {
                loadProjectFile(requestData);
            }
            else {
                if (requestData.filePath.startsWith("/code/")) {
                    loadResourceFile(requestData);
                }
                else {
                    if (requestData.filePath.equals("/favicon.ico")) {
                        loadFavIconFile(requestData);
                    }
                    else {
                        requestData.setError(403,"Access Forbidden");
                    }
                }
            }
                
            if (requestData.replyCode!=200) {
                if (requestData.replyCode!=304) app.log("HTTP Error: "+requestData.replyCode+" "+requestData.errorStr);
                writeError(requestData.replyCode,requestData.errorStr);
                return;
            }
            
            writeFile(requestData);
        }
        catch (Exception e)
        {
            try { writeError(500,"Internal Server Error"); } catch(Exception e2) {}  // if unable to write error back to client, we have to eat it, this happens with broken pipes
        }
        finally {
            try {
                socket.shutdownInput();
                socket.shutdownOutput();
            }
            catch (Exception e) {}      // try to catch these separately, so worst to worst, we can at least close the socket
            try {
                socket.close();
            }
            catch (Exception e) {}      // again, nothing we can do if we can't close the sockets
        }
    }
    
        //
        // additional class to pass http request around
        //
    
    private class HTTPRequestData
    {
        public int          replyCode;
        public boolean      noCache;
        public String       method,address,contentType,
                            filePath,errorStr;
        public Calendar     ifModified,lastModified;
        public byte[]       contentBytes,postBytes;
        
        public HTTPRequestData()
        {
            replyCode=200;
            noCache=false;
            
            postBytes=null;
        }
        
        public void setError(int replyCode,String errorStr)
        {
            this.replyCode=replyCode;
            this.errorStr=errorStr;
        }
    }
}