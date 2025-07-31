package com.example.tasksmanage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;

@SpringBootApplication(exclude = FlywayAutoConfiguration.class)
public class TasksManageApplication {
    public static void main(String[] args) {
        SpringApplication.run(TasksManageApplication.class, args);
    }
}
