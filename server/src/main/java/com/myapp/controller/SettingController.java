package com.myapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myapp.domain.itaran.BoardGenre;
import com.myapp.repository.SettingRepository;

@RestController
@RequestMapping("api/setting")
public class SettingController {
	@Autowired
	private SettingRepository repository;
	
	@RequestMapping(BoardGenre.id)
	public BoardGenre get() {
		return repository.fetchSetting(BoardGenre.class, BoardGenre.id);
	}
	
}
