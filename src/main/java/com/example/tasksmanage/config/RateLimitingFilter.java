package com.example.tasksmanage.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter implements Filter {
    private static final int MAX_REQUESTS_PER_MINUTE = 60;
    private final Map<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
    private final Map<String, Long> lastReset = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        if (request instanceof HttpServletRequest httpRequest) {
            String ip = httpRequest.getRemoteAddr();
            long now = System.currentTimeMillis();
            lastReset.putIfAbsent(ip, now);
            if (now - lastReset.get(ip) > 60000) {
                requestCounts.put(ip, new AtomicInteger(0));
                lastReset.put(ip, now);
            }
            int count = requestCounts.computeIfAbsent(ip, k -> new AtomicInteger(0)).incrementAndGet();
            if (count > MAX_REQUESTS_PER_MINUTE) {
                ((HttpServletResponse) response).setStatus(429); // 429 Too Many Requests
                response.getWriter().write("Rate limit exceeded");
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
