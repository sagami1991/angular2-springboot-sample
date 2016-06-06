package com.myapp.util;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import java.util.Set;

/**
 * Bean Validationの@Validを手動で実行する.
 */
public class ValidationUtil {
    static javax.validation.Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    //ジェネリクスの使い方ってこれで？
    public static <T> void valid (T obj) {
        Set<ConstraintViolation<T>> violations = validator.validate(obj);
        for (ConstraintViolation<T> violation : violations) {
            throw new IllegalArgumentException(violation.getMessage());
        }

    }
}
