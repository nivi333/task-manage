package com.example.tasksmanage.service;

import com.example.tasksmanage.model.Webhook;
import com.example.tasksmanage.model.WebhookEventLog;
import com.example.tasksmanage.repository.WebhookRepository;
import com.example.tasksmanage.repository.WebhookEventLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.List;

@Service
public class WebhookService {
    @Autowired private WebhookRepository webhookRepository;
    @Autowired private WebhookEventLogRepository logRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Async
    public void sendEvent(String eventType, Object data) {
        List<Webhook> webhooks = webhookRepository.findByActiveTrue();
        for (Webhook wh : webhooks) {
            if (wh.getEvents() != null && wh.getEvents().contains(eventType)) {
                sendWithRetry(wh, eventType, data, 0);
            }
        }
    }

    private void sendWithRetry(Webhook wh, String eventType, Object data, int attempt) {
        try {
            String payload = objectMapper.writeValueAsString(data);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.add("X-Event-Type", eventType);
            String signature = signPayload(wh.getSecret(), payload);
            headers.add("X-Signature", "sha256=" + signature);

            HttpEntity<String> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.exchange(wh.getCallbackUrl(), HttpMethod.POST, entity, String.class);

            createLog(wh, eventType, payload, attempt + 1,
                    response.getStatusCode().is2xxSuccessful() ? "SUCCESS" : "FAILED",
                    response.getStatusCodeValue(), null);

            if (!response.getStatusCode().is2xxSuccessful() && attempt < 2) {
                Thread.sleep((long) Math.pow(2, attempt) * 1000);
                sendWithRetry(wh, eventType, data, attempt + 1);
            }
        } catch (Exception e) {
            createLog(wh, eventType, null, attempt + 1, "ERROR", null, e.getMessage());
            if (attempt < 2) {
                try { Thread.sleep((long) Math.pow(2, attempt) * 1000); } catch (InterruptedException ie) {}
                sendWithRetry(wh, eventType, data, attempt + 1);
            }
        }
    }

    private WebhookEventLog createLog(Webhook wh, String eventType, String payload,
                                      int attempt, String status, Integer code, String error) {
        WebhookEventLog log = new WebhookEventLog();
        log.setWebhook(wh);
        log.setEventType(eventType);
        log.setPayload(payload != null ? payload : "");
        log.setAttemptCount(attempt);
        log.setStatus(status);
        log.setResponseCode(code);
        log.setErrorMessage(error);
        log.setLastAttemptAt(Instant.now());
        return logRepository.save(log);
    }

    private String signPayload(String secret, String payload) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKey);
        byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hash);
    }
}
