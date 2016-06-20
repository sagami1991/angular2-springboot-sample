package com.myapp.domain;

import org.springframework.data.annotation.Id;

import lombok.Data;

@Data
public class Tokka {
	@Id
	private String id;
	private String title;
	private Integer price;
	private String siteName;
	private String imgUrl;
}
