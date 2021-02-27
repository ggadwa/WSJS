package com.klinksoftware.wsjs.application;

import java.io.*;
import java.util.*;

public class ProjectList
{
    private final App                   app;
    private TreeMap<String,Project>     projects;
    
    public ProjectList(App app)
    {
        this.app=app;
        
        projects=new TreeMap<>();
    }
    
        //
        // build the list of projects and start/stop list
        // we do this separately so appwindow can be initiated and
        // log can be started
        //
    
    public void scanForProjects(String projectPath)
    {
        String          name;
        File            projectDir;
        
        projectDir=new File(projectPath);
        
        for (File file:projectDir.listFiles()) {
            if (!file.isDirectory()) continue;
            
            name=file.getName();
            projects.put(name,new Project(app,name,file.getAbsolutePath()));
        }
    }
    
    public void start()
    {
        for (Project project:projects.values()) {
            project.start();
        }
    }
    
    public void stop()
    {
        for (Project project:projects.values()) {
            project.stop();
        }
    }

        //
        // getters
        //
    
    public String[] getListAsStringArray()
    {
        return((String[])projects.keySet().toArray(new String[projects.size()]));
    }
    
    public Project get(String name)
    {
        return(projects.get(name));
    }
    
    public Collection<Project> getProjects()
    {
        return(projects.values());
    }
}
