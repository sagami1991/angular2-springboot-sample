package com.myapp.controller;

import static com.myapp.util.CommonUtil.strToList;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.myapp.domain.itaran.Board;
import com.myapp.repository.BoardRepository;

@RestController
@RequestMapping("api/boards")
public class BoardController {
	@Autowired
	private BoardRepository repository;
	
	/** 板名リスト受け取ってリストで返す */
	// TODO 並び替え
	@RequestMapping("bynames")
	public List<Board> findByNames(@RequestParam("names") String names) {
		return repository.findByNames(strToList(names));
	}
}
