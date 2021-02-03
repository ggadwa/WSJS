package com.klinksoftware.wsjs.main;

import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.*;
import org.springframework.context.*;
import org.springframework.context.annotation.*;

@SpringBootApplication
@ComponentScan(basePackages={"com.klinksoftware.wsjs"})
public class Application
{
    private static ConfigurableApplicationContext       springCtx;
    
    public static void stop()
    {
        springCtx.stop();
    }
    
    public static void main(String[] args)
    {
        System.setProperty("java.awt.headless","false");
        springCtx=SpringApplication.run(Application.class,args);
    }
}

