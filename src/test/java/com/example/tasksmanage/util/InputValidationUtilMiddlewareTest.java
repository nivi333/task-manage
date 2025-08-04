package com.example.tasksmanage.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class InputValidationUtilMiddlewareTest {
    @Test
    void testSanitize() {
        assertEquals("abc", InputValidationUtil.sanitize("abc"));
        assertEquals("a&lt;b&gt;", InputValidationUtil.sanitize("a<b>"));
    }
}
