package com.klinksoftware.wsjs.application;

import com.klinksoftware.wsjs.ui.*;
import com.klinksoftware.wsjs.http.*;
import com.klinksoftware.wsjs.websockets.*;

import java.io.*;
import java.util.*;

public class App
{
    private String                      workingPath,projectPath,dataPath;
    private Calendar                    startUpTime;
    private AppWindow                   appWindow;
    private ProjectList                 projectList;
    private Storage                     storage;
    private ArrayList<WebSocketClient>  clients;
    
    private static final Object         mainLock,httpLock,webSocketLock;
    
    static
    {
        mainLock=new Object();
        httpLock=new Object();
        webSocketLock=new Object();
    }
    
        //
        // app information
        //
    
    public Calendar getStartUpTime()
    {
        return(startUpTime);
    }
    
    public String getWorkingPath()
    {
        return(workingPath);
    }
    
    public String getDataPath()
    {
        return(dataPath);
    }
    
    public void log(String str)
    {
        appWindow.log(str);
    }
    
    public void addUser(String userId)
    {
        storage.addUser(userId);
    }
    
    public void updateUserList()
    {
        appWindow.updateUserList(clients);
    }
    
    public void updateStatus()
    {
        appWindow.updateStatus();
    }
    
    public void addStatusNetworkBytes(int byteCount)
    {
        appWindow.addStatusNetworkBytes(byteCount);
    }
    
    public ProjectList getProjectList()
    {
        return(projectList);
    }
    
    public ArrayList<WebSocketClient> getClientList()
    {
        return(clients);
    }
    
        //
        // build needed paths
        //
        
    private void buildWorkingPath()
    {
        workingPath=(new File("")).getAbsolutePath();
        if ((workingPath.endsWith("\\")) || (workingPath.endsWith("/"))) workingPath=workingPath.substring(0,(workingPath.length()-1));
    }
    
    private void buildProjectPath()
    {
        projectPath=workingPath+File.separator+"projects";
    }
    
    private void buildDataPath()
    {
        String          osName;
        
            // this seems to be the best way to find
            // a location to store WSJS data, if anybody
            // knows something better I'd like to hear it
            
        osName=System.getProperty("os.name").toLowerCase();
        
        if (osName.contains("os x")) {
            dataPath=System.getProperty("user.home")+File.separator+"Library"+File.separator+"Application Support"+File.separator+"WSJS";
        }
        else {
            if (osName.contains("win")) {
                dataPath=System.getenv("AppData")+File.separator+"WSJS";
            }
            else {
                dataPath=System.getProperty("user.home")+File.separator+"WSJS"; // untested
            }
        }
        
            // make sure the folder exists
            
        (new File(dataPath)).mkdir();
    }
    
        //
        // wait triggers for http and webSocket thread startups
        //
            
    public void triggerHTTPStartUpFinished()
    {
        synchronized(httpLock) {
            httpLock.notify();
        }
    }
    
    public void triggerWebSocketStartUpFinished()
    {
        synchronized(webSocketLock) {
            webSocketLock.notify();
        }
    }
    
        //
        // stop the application
        //
    
    public void stop()
    {
        synchronized(mainLock) {
            mainLock.notify();
        }
    }
    
        //
        // main application run
        //
    
    public void run()
    {
        HTTPListener            httpListener;
        WebSocketListener       webSocketListener;
        Thread                  httpListenerThread,webSocketListenerThread;

            // build paths and startup time
            // the startup time is used to timestampt
            // resource requests
            
        startUpTime=Calendar.getInstance();
        
        buildWorkingPath();
        buildProjectPath();
        buildDataPath();
        
            // build the project list
            
        projectList=new ProjectList(this);
        projectList.build(projectPath);
        
            // the multiplayer clients
            
        clients=new ArrayList<>();
        
            // start the window
        
        appWindow=new AppWindow(this);
        appWindow.start();
        
        appWindow.log("Starting");
        appWindow.log("Working path: "+workingPath);
        appWindow.log("Project path: "+projectPath);
        appWindow.log("Data path: "+dataPath);
       
            // start the persistent data storage
           
        storage=new Storage(this);
        storage.start();
        
            // start the http listener, and wait
            // for a confirmed start
        
        httpListener=new HTTPListener(this);
        httpListenerThread=new Thread(httpListener,("http_listener_thread"));
        httpListenerThread.start();
        
        synchronized(httpLock) {
            try {
                httpLock.wait();
            }
            catch(InterruptedException e)   // todo -- not sure what case happens here
            {
            }
        }
        
            // start the websocket listener, and wait
            // for a confirmed start

        webSocketListener=new WebSocketListener(this);
        webSocketListenerThread=new Thread(webSocketListener,("ws_listener_thread"));
        webSocketListenerThread.start();

        synchronized(webSocketLock) {
            try {
                webSocketLock.wait();
            }
            catch(InterruptedException e)   // todo -- not sure what case happens here
            {
            }
        }
        
            // lock the main thread until it's time to quit
            
        synchronized(mainLock) {
            try {
                mainLock.wait();
            }
            catch(InterruptedException e)
            {
                appWindow.log("Main loop got interrupted, bailing: "+e.getMessage());
            }
        }
        
            // shutdown websocket listener

        webSocketListener.shutdown();
        try { webSocketListenerThread.join(); } catch(InterruptedException e) {}    // nothing to do if this is interupted, we are shutting down anyway
        
            // shutdown http listener
            
        httpListener.shutdown();
        try { httpListenerThread.join(); } catch(InterruptedException e) {}         // nothing to do if this is interupted, we are shutting down anyway
        
            // shutdown storage, window, and spring
            
        storage.stop();
        
        appWindow.log("Server closed");
        appWindow.stop();
    }

}
