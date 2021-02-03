package com.klinksoftware.wsjs.main;

import com.klinksoftware.wsjs.ui.*;
import com.klinksoftware.wsjs.websockets.*;

import java.io.*;
import java.util.*;

public class WSServer
{
    private static final AppWindow                  appWindow;
    private static final ArrayList<WebSocketClient> clients;
    private static final Storage                    storage;
    
    private static String                           dataPath;
    private static WebSocketListener                webSocketListener;
    private static Thread                           webSocketListenerThread;
    
    static
    {
        appWindow=new AppWindow();
        clients=new ArrayList<>();
        storage=new Storage();
    }
    
    public static String getDataPath()
    {
        return(dataPath);
    }
    
    public static AppWindow getAppWindow()
    {
        return(appWindow);
    }
    
    public static ArrayList<WebSocketClient> getClientList()
    {
        return(clients);
    }
    
    public static Storage getStorage()
    {
        return(storage);
    }
        
    private static void buildDataPath()
    {
        String          osName;
        
            // this seems to be the best way to find
            // a location to store WSServer data, if anybody
            // knows something better I'd like to hear it
            
        osName=System.getProperty("os.name").toLowerCase();
        
        if (osName.contains("os x")) {
            dataPath=System.getProperty("user.home")+File.separator+"Library"+File.separator+"Application Support"+File.separator+"WSServer";
        }
        else {
            if (osName.contains("win")) {
                dataPath=System.getenv("AppData")+File.separator+"WSServer";
            }
            else {
                dataPath=System.getProperty("user.home")+File.separator+"WSServer"; // untested
            }
        }
        
            // make sure the folder exists
            
        (new File(dataPath)).mkdir();
    }
    
    public static void start()
    {
        buildDataPath();
        
            // start the window
        
        appWindow.start();
        
        appWindow.log("Starting");
        appWindow.log("Data path: "+dataPath);
       
            // load the data
            
        storage.start();
        
            // start the websocket server on it's own thread
            // and wait for a confirmed start

        webSocketListener=new WebSocketListener();
        webSocketListenerThread=new Thread(webSocketListener,("ws_listener_thread"));
        webSocketListenerThread.start();
    }

    public static void stop()
    {
            // shutdown websockets
            
        if (webSocketListener!=null) {
            webSocketListener.shutdown();
            try { webSocketListenerThread.join(); } catch(InterruptedException e) {}       // nothing to do if this is interupted, we are shutting down anyway
        }
        
            // shutdown storage, window, and spring
            
        storage.stop();
        
        appWindow.log("Server closed");
        appWindow.stop();
            
        Application.stop();
    }

}
