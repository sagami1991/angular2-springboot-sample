package com.myapp.controller;

import com.myapp.domain.TeamRank;
import com.myapp.repository.TeamRankRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/rank")
public class TyokinController {
	@Autowired
	private TeamRankRepository repository;
	
	@RequestMapping(value = "{leagueType}")
	public TeamRank get(@PathVariable("leagueType") String leagueType) {
		return repository.findLastUpdated(leagueType);
	}
	
}
