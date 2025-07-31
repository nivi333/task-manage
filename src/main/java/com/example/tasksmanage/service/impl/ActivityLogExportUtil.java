package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.model.ActivityLog;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.stream.Collectors;

public class ActivityLogExportUtil {
    public static String toCsv(List<ActivityLog> logs) {
        String header = "id,timestamp,user,action,entityType,entityId,details";
        String rows = logs.stream().map(log -> String.join(",",
            String.valueOf(log.getId()),
            String.valueOf(log.getTimestamp()),
            log.getUser() != null ? log.getUser().getUsername() : "",
            log.getAction(),
            log.getEntityType() != null ? log.getEntityType() : "",
            log.getEntityId() != null ? log.getEntityId() : "",
            log.getDetails() != null ? log.getDetails().replaceAll(",",";") : ""
        )).collect(Collectors.joining("\n"));
        return header + "\n" + rows;
    }

    public static String toJson(List<ActivityLog> logs) {
        try {
            return new ObjectMapper().writeValueAsString(logs);
        } catch (Exception e) {
            return "[]";
        }
    }
}
