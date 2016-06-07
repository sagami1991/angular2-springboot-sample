package com.myapp.controller;

import com.myapp.domain.BoardGenre;
import com.myapp.domain.TeamRank;
import com.myapp.repository.SettingRepository;
import com.myapp.repository.TeamRankRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
