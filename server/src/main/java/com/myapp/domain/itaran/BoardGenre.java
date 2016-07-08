package com.myapp.domain.itaran;

import java.util.List;

import lombok.Data;

/**
 * Created by m on 2016/06/06.
 */
@Data
public class BoardGenre {
    static final public String id = "boardlist";
    private String name;
    private List<Board> boards;
}
