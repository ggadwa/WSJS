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
    
    public void build(String projectPath)
    {
        String          name;
        File            projectDir;
        Project         project;
        
        projectDir=new File(projectPath);
        
        for (File file:projectDir.listFiles()) {
            if (!file.isDirectory()) continue;
            
            name=file.getName();
            
            project=new Project(name,file.getAbsolutePath());
            if (project.load(app)) projects.put(name,project);
        }
    }
    
    public String[] getListAsStringArray()
    {
        return((String[])projects.keySet().toArray(new String[projects.size()]));
    }
    
    public Project get(String name)
    {
        return(projects.get(name));
    }
}
