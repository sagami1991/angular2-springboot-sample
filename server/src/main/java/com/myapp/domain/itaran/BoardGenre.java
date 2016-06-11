package com.myapp.domain.itaran;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

/**
 * Created by m on 2016/06/06.
 */
@Data
public class BoardGenre {
    static final public String id = "boardlist";
    private String name;
    private List<Board> boards;
}
