package com.klinksoftware.wsjs.main;

import java.io.*;
import java.util.*;

public class Storage
{
    private static final String STORAGE_FILE_NAME="wsserver_db.dat";
    
    private HashMap<String,HashMap<String,Object>>      db;
    
        public String getPath(String name)
    {
        return(WSServer.getDataPath()+File.separator+name);
    }
    
    public Object load(String name)
    {
        byte[]                  bytes;
        Object                  obj;
        File                    file;
        FileInputStream         fileIn;
        ByteArrayInputStream    byteIn;
        ObjectInputStream       objIn;
        
            // is there a file to pick up?
            
        file=new File(getPath(name));
        if (!file.exists()) return(null);
        
            // load in the data
            
        fileIn=null;
        
        try {
            fileIn=new FileInputStream(file);
            bytes=new byte[(int)file.length()];
            fileIn.read(bytes);
        }
        catch (Exception e)
        {
            e.printStackTrace();
            return(null);
        }
        finally {
            if (fileIn==null) try { fileIn.close(); } catch(Exception e2) {}        // can eat this, we are either done or shutting down from error
        }
        
            // convert it back to the hashmap
        
        byteIn=new ByteArrayInputStream(bytes);
        
        try {
            objIn=new ObjectInputStream(byteIn);
            obj=objIn.readObject();
            objIn.close();
        }
        catch(Exception e)
        {
            e.printStackTrace();
            return(null);
        }
        
        return(obj);
    }
    
    public boolean save(String name,Object obj)
    {
        byte[]                  bytes;
        FileOutputStream        fileOut;
        ByteArrayOutputStream   byteOut;
        ObjectOutput            objOut;
        
            // convert storage to byte array
        
        objOut=null;
        byteOut=new ByteArrayOutputStream();

        try {
            objOut=new ObjectOutputStream(byteOut);
            objOut.writeObject(obj);
            objOut.flush();
            objOut.close();
            objOut=null;        // for finally block
            
            bytes=byteOut.toByteArray();
        }
        catch (Exception e)
        {
            e.printStackTrace();
            return(false);
        }
        finally {
            if (objOut!=null) try { objOut.close(); } catch(Exception e2) {}
            try { byteOut.close(); } catch(Exception e2) {}
        }
        
            // write users out to disk
        
        fileOut=null;
        
        try {
            fileOut=new FileOutputStream(getPath(name));
            fileOut.write(bytes);
        }
        catch (Exception e) {
            e.printStackTrace();
            return(false);
        }
        finally {
            if (fileOut!=null) try { fileOut.close(); } catch(Exception e2) {}
        }
        
        return(true);
    }
    
    public void start()
    {
        db=(HashMap<String,HashMap<String,Object>>)load(STORAGE_FILE_NAME);
        if (db==null) {
            WSServer.getAppWindow().log("No saved or unable to load persistant storage, starting with empty: "+getPath(STORAGE_FILE_NAME));
            db=new HashMap<>();
        }
        else {
            WSServer.getAppWindow().log("Read persistant storage from disk: "+getPath(STORAGE_FILE_NAME));
        }
    }
    
    public void stop()
    {
        if (save(STORAGE_FILE_NAME,db)) {
            WSServer.getAppWindow().log("Wrote persistant storage to disk: "+getPath(STORAGE_FILE_NAME));
        }
        else {
            WSServer.getAppWindow().log("Unable to write persistant storage to disk: "+getPath(STORAGE_FILE_NAME));
        }        
    }
    
    public void addUser(String userId)
    {
        if (!db.containsKey(userId)) db.put(userId,new HashMap<>());
    }
    
    public ArrayList<String> getUserList()
    {
        return(new ArrayList<>(db.keySet()));
    }
    
    public void setUserValue(String userId,String name,Object value)
    {
        HashMap<String,Object>      userValues;
        
        userValues=db.get(userId);
        if (userValues!=null) userValues.put(name,value);
    }
    
    public Object getUserValue(String userId,String name)
    {
        HashMap<String,Object>      userValues;
        
        userValues=db.get(userId);
        if (userValues==null) return(null);
        
        return(userValues.get(name));
    }
    
}
