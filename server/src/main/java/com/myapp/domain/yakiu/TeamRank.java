package com.myapp.domain.yakiu;

import java.util.Date;
import java.util.List;

import javax.validation.constraints.NotNull;

import lombok.Data;


/**
 * Created by m on 2016/05/29.
 */
@Data
public class TeamRank {
	public static final String collection = "yakiuRanking";
    @NotNull
    private String league;
    private Date updated;
    private List<Tyokin> ranking;
}
