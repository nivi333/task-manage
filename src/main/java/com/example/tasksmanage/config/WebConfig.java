package com.example.tasksmanage.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(@org.springframework.lang.NonNull CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("https://yourdomain.com", "http://localhost:8081", "http://localhost:8080", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type", "X-API-KEY", "Accept")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry registry) {
        // Serve /avatars/** from the avatars directory in the project root or configurable location
        registry.addResourceHandler("/avatars/**")
                .addResourceLocations("file:/Users/nivetharamdev/Projects/tasks-manage/src/main/resources/avatars/");
    }
}

