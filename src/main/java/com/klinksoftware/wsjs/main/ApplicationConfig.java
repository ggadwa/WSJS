package com.klinksoftware.wsjs.main;

import javax.annotation.*;
import org.springframework.stereotype.*;
import org.springframework.web.servlet.config.annotation.*;

@Component
public class ApplicationConfig implements WebMvcConfigurer
{
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry)
    {
        registry
            .addResourceHandler("/projects/**")
            .addResourceLocations("file:./projects/");
    }
}
