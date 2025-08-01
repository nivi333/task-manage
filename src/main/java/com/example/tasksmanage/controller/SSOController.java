package com.example.tasksmanage.controller;

import com.example.tasksmanage.service.SSOService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sso")
public class SSOController {
    @Autowired
    private SSOService ssoService;

    @GetMapping("/saml/request")
    public ResponseEntity<String> getSamlRequestUrl() {
        return ResponseEntity.ok(ssoService.getSamlRequestUrl());
    }

    @PostMapping("/saml/response")
    public ResponseEntity<String> handleSamlResponse(@RequestParam String samlResponse) {
        ssoService.handleSamlResponse(samlResponse);
        return ResponseEntity.ok("SAML response handled");
    }

    @GetMapping("/oauth2/authorize/{provider}")
    public ResponseEntity<String> getOAuth2AuthorizationUrl(@PathVariable String provider) {
        return ResponseEntity.ok(ssoService.getOAuth2AuthorizationUrl(provider));
    }

    @GetMapping("/oauth2/callback/{provider}")
    public ResponseEntity<String> handleOAuth2Callback(@PathVariable String provider, @RequestParam String code) {
        ssoService.handleOAuth2Callback(provider, code);
        return ResponseEntity.ok("OAuth2 SSO callback handled for " + provider);
    }
}
