package com.example.tasksmanage.controller;

import com.example.tasksmanage.service.OAuth2Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/oauth2")
public class OAuth2Controller {
    @Autowired
    private OAuth2Service oAuth2Service;

    @GetMapping("/authorize/{provider}")
    public ResponseEntity<Map<String, String>> authorize(@PathVariable String provider) {
        String authUrl = oAuth2Service.getAuthorizationUrl(provider);
        return ResponseEntity.ok(Map.of("authorization_url", authUrl));
    }

    @GetMapping("/callback/{provider}")
    public ResponseEntity<String> callback(@PathVariable String provider, HttpServletRequest request) {
        String code = request.getParameter("code");
        oAuth2Service.handleCallback(provider, code);
        return ResponseEntity.ok("OAuth2 callback handled for " + provider);
    }
}
