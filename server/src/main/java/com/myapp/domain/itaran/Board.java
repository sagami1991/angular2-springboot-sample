package com.myapp.domain.itaran;

import java.util.Date;

import org.springframework.data.annotation.Id;

import lombok.Data;

/**
 * Created by m on 2016/06/06.
 */
@Data
public class Board {
	@Id
	private String id;
	private String genre;
    private String name;
    private String domain;
    private String server;
    private String board;
    private String defaultName;
	/** 最後に2ch.netからスクレイピングした日付、last-modifedとは別 */
	private Date lastUpdate;
}
