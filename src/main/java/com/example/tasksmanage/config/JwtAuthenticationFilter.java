package com.example.tasksmanage.config;

import com.example.tasksmanage.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtil jwtUtil;

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String jwt = getJwtFromRequest(request);
        if (!StringUtils.hasText(jwt)) {
            // Debug: no Authorization header
            if (isDebugEnabled()) {
                log.debug("[JWT] No Bearer token for {} {}", request.getMethod(), request.getRequestURI());
            }
        } else if (jwtUtil.isTokenValid(jwt)) {
            Claims claims = jwtUtil.getClaims(jwt);
            String username = claims.getSubject();
            if (isDebugEnabled()) {
                log.debug("[JWT] Valid token for user={} path={}", username, request.getRequestURI());
            }
            // Extract roles claim and convert to Spring authorities (ROLE_*)
            List<?> rolesClaim = claims.get("roles", List.class);
            List<SimpleGrantedAuthority> authorities = rolesClaim != null
                    ? rolesClaim.stream()
                    .map(Object::toString)
                    .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList())
                    : Collections.emptyList();
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    username, null, authorities);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } else {
            if (isDebugEnabled()) {
                log.debug("[JWT] Invalid token for {} {}", request.getMethod(), request.getRequestURI());
            }
        }
        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private boolean isDebugEnabled() {
        // Toggle via standard logging configuration; keep method for clarity/extension
        return log.isDebugEnabled();
    }
}
