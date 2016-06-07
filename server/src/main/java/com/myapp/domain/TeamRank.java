package com.myapp.domain;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.util.Date;
import java.util.List;


/**
 * Created by m on 2016/05/29.
 */
@Data
public class TeamRank {
    @Pattern(regexp = "[ce|pa]")
    private String type;
    @NotNull
    private Date updated;
    private List<Tyokin> teams;
}
