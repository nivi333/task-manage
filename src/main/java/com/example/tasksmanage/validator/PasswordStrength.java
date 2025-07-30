package com.example.tasksmanage.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = PasswordStrengthValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface PasswordStrength {
    String message() default "Password must be at least 8 characters, contain upper and lower case letters, a digit, and a special character.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
