package com.cafecito.cafecito.backend.config.security;

import com.cafecito.cafecito.backend.core.base.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String path = request.getRequestURI() == null ? "" : request.getRequestURI();
        final boolean debugAuth = path.contains("/api/admin/menu/products/") && path.endsWith("/image");

        final String authHeader = request.getHeader("Authorization");
        String email = null;
        String jwt = null;

        if (debugAuth) {
            boolean hasAuth = authHeader != null && !authHeader.isBlank();
            boolean isBearer = authHeader != null && authHeader.startsWith("Bearer ");
            String ct = request.getContentType();
            log.info("AuthDebug: {} {} authHeaderPresent={} bearer={} contentType={}", request.getMethod(), path, hasAuth, isBearer, ct);
            try {
                var names = request.getHeaderNames();
                if (names != null) {
                    java.util.List<String> headerNames = new java.util.ArrayList<>();
                    while (names.hasMoreElements()) {
                        headerNames.add(names.nextElement());
                    }
                    log.info("AuthDebug: headerNames={}", headerNames);
                }
            } catch (Exception ignored) {
                // ignore
            }
        }

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            try {
                email = jwtUtil.extractEmail(jwt);
            } catch (Exception e) {
                // Token is invalid
                if (debugAuth) {
                    log.info("AuthDebug: token parse failed (extractEmail)");
                }
            }
        }

        if (debugAuth) {
            log.info("AuthDebug: extractedEmailPresent={}", email != null);
        }

        Authentication existingAuth = SecurityContextHolder.getContext().getAuthentication();
        boolean canSetAuth = existingAuth == null || existingAuth instanceof AnonymousAuthenticationToken;

        if (debugAuth) {
            log.info("AuthDebug: existingAuthType={} canSetAuth={}", existingAuth == null ? null : existingAuth.getClass().getSimpleName(), canSetAuth);
        }

        if (email != null && canSetAuth) {
            try {
                var userOpt = userRepository.findByEmailIgnoreCase(email);
                if (userOpt.isEmpty()) {
                    filterChain.doFilter(request, response);
                    return;
                }

                var user = userOpt.get();
                boolean valid = false;
                try {
                    valid = jwtUtil.validateToken(jwt, email);
                } catch (Exception e) {
                    valid = false;
                }

                if (debugAuth) {
                    log.info("AuthDebug: userFound=true tokenValid={}", valid);
                }

                if (valid) {
                    UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                            user.getEmail(),
                            user.getPassword(),
                            new ArrayList<>()
                    );

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception ignored) {
                // Leave unauthenticated; SecurityFilterChain will return 401 via entry point.
                if (debugAuth) {
                    log.info("AuthDebug: exception during auth; leaving unauthenticated");
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
