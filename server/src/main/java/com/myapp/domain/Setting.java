package com.myapp.domain;

/**
 * Created by m on 2016/06/07.
 */

import lombok.AllArgsConstructor;
import lombok.Data;

/***/
@Data
@AllArgsConstructor
public class Setting<T> {
    private String id;
    private T data;
}
