package com.shadow.fyp.config;

import com.shadow.fyp.model.UserRole;
import com.shadow.fyp.util.RequestContext;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class IdentityFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest r = (HttpServletRequest) req;

        String uid = r.getHeader("X-USER-ID");
        String role = r.getHeader("X-USER-ROLE");

        if (uid != null && role != null) {
            RequestContext.set(
                Long.parseLong(uid),
                UserRole.valueOf(role)
            );
        }

        try {
            chain.doFilter(req, res);
        } finally {
            RequestContext.clear();
        }
    }
}
