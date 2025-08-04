package com.example.tasksmanage.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class SecurityHeadersFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        if (response instanceof HttpServletResponse resp) {
            resp.setHeader("X-Content-Type-Options", "nosniff");
            resp.setHeader("X-Frame-Options", "SAMEORIGIN");
            resp.setHeader("X-XSS-Protection", "1; mode=block");
            resp.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
            resp.setHeader("Referrer-Policy", "no-referrer");
            resp.setHeader("Content-Security-Policy", "default-src 'self'");
        }
        chain.doFilter(request, response);
    }
}
