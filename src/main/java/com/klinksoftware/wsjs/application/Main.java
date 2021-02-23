package com.klinksoftware.wsjs.application;

import com.klinksoftware.wsjs.ui.*;

public class Main
{
    private static App          app;
    
    public static void main(String[] args)
    {
        //System.setProperty("java.awt.headless","false");
        
        app=new App();
        app.run();
    }    
}
