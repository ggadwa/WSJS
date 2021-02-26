package com.klinksoftware.wsjs.application;

import com.klinksoftware.wsjs.websockets.*;

import java.util.*;
import java.io.*;
import com.fasterxml.jackson.core.type.*;
import com.fasterxml.jackson.databind.*;

public class Project
{
    private int                         gameIndex,mapIndex;
    private String                      name,path;
    private List<String>                multiplayerGames;
    private List<String>                multiplayerMaps;
    private ArrayList<WebSocketClient>  clients;
    
    private static final ObjectMapper objectMapper=new ObjectMapper();
    
    public Project(String name,String path)
    {
        this.name=name;
        this.path=path;
        
        gameIndex=0;
        mapIndex=0;
    }
    
    public boolean load(App app)
    {
        File                    coreJson;
        Map<String,Object>      coreMap;
        
            // translate the core json
        
        try {
            coreJson=new File(path+File.separator+"html"+File.separator+"core.json");
            coreMap=objectMapper.readValue(coreJson,new TypeReference<Map<String,Object>>(){});
        }
        catch (IOException e)
        {
            app.log("Unable to read html/core.json: "+e.getMessage());
            return(false);
        }
        
            // get multiplayer games and maps
            
        multiplayerGames=(List<String>)coreMap.get("multiplayerGames");
        multiplayerMaps=(List<String>)coreMap.get("multiplayerMaps");
        
        return(true);
    }
    
    public List<String> getMultiplayerGames()
    {
        return(multiplayerGames);
    }
    
    public int getGameIndex()
    {
        return(gameIndex);
    }
    
    public List<String> getMultiplayerMaps()
    {
        return(multiplayerMaps);
    }
    
    public int getMapIndex()
    {
        return(mapIndex);
    }
}
