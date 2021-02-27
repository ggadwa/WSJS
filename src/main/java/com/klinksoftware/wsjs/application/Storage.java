package com.klinksoftware.wsjs.application;

import java.io.*;
import java.util.*;
import com.fasterxml.jackson.core.type.*;
import com.fasterxml.jackson.databind.*;

public class Storage
{
    private final String                            dbPath;
    private final App                               app;
    private final Project                           project;
    private Map<String,HashMap<String,Object>>      db;
    
    private static final ObjectMapper objectMapper=new ObjectMapper();
    
    public Storage(App app,Project project)
    {
        this.app=app;
        this.project=project;
        
        dbPath=app.getDataPath()+File.separator+"wsjs_"+project.getName()+"_db.json";
    }
    
    public void load() throws Exception
    {
        File                    file;
        
            // is there a file to pick up?
            
        file=new File(dbPath);
        if (!file.exists()) throw new Exception("File does not exist");
        
            // translate the db to json
        
        db=objectMapper.readValue(file,new TypeReference<Map<String,HashMap<String,Object>>>(){});
    }
    
    public void save() throws Exception
    {
        File                    file;
        
        file=new File(dbPath);
        
            // covert to file
            
        objectMapper.writeValue(file,db);
    }
    
    public void start()
    {
        try {
            load();
            app.log("Read persistant storage from disk: "+dbPath);
        }
        catch (Exception e) {
            app.log("Unable to load persistant storage, starting with empty: "+dbPath+" ("+e.getMessage()+")");
            db=new HashMap<>();
        }
    }
    
    public void stop()
    {
        try {
            save();
            app.log("Wrote persistant storage to disk: "+dbPath);
        }
        catch (Exception e) {
            app.log("Unable to write persistant storage to disk: "+dbPath+" ("+e.getMessage()+")");
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
