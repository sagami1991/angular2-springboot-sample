package com.myapp.domain;


import org.springframework.data.annotation.Id;

import lombok.Data;

@Data
public class Sure {
	@Id
	private String id;
	/** 板ID */
    private String bid;
	private String datNo;
	private String suretai;
	private Integer length;
	private boolean otiteru;
}

