package com.shadow.fyp.util;

import com.shadow.fyp.model.UserRole;

public class RequestContext {
    private static final ThreadLocal<Long> userId = new ThreadLocal<>();
    private static final ThreadLocal<UserRole> role = new ThreadLocal<>();

    public static void set(Long id, UserRole r) {
        userId.set(id);
        role.set(r);
    }

    public static Long userId() {
        return userId.get();
    }

    public static UserRole role() {
        return role.get();
    }

    public static void clear() {
        userId.remove();
        role.remove();
    }
}
