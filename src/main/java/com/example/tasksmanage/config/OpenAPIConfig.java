package com.example.tasksmanage.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.servers.Server;

import java.util.List;

@Configuration
public class OpenAPIConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Task Management API")
                        .version("v1")
                        .description("API documentation for the Task Management System.")
                        .contact(new Contact()
                                .name("Nivetha Ramdev")
                                .email("nivetha@example.com")
                                .url("https://github.com/nivi333/task-manage"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://springdoc.org")))
                .externalDocs(new ExternalDocumentation()
                        .description("Project Wiki")
                        .url("https://github.com/nivi333/task-manage/wiki"))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Dev Server")
                ));
    }
}
