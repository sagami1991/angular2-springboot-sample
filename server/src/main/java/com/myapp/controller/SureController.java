package com.myapp.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myapp.domain.Sure;
import com.myapp.domain.itaran.Board;
import com.myapp.repository.BoardRepository;
import com.myapp.repository.SureRepository;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

@RestController
@RequestMapping("api/sureran")
public class SureController {
	@Autowired
	BoardRepository boardRepository;
	@Autowired
	SureRepository sureRepository;
	@Autowired
	OkHttpClient client;
	
	/** 前回のスクレイピング時間 */
	private Date befCrawlTime = new Date();
	
	@RequestMapping(value = "/bid/{boardId}")
	public Map<String, Object> findByBid(@PathVariable("boardId") String bid) throws IOException {
		
		Map<String, Object> map = new HashMap<>();
		//前回より5秒経ってたらスクレイピングしてインサート
		if(new Date().getTime() - befCrawlTime.getTime() > 5*1000){
			scrapingSureran(map,bid);
		}
		map.put("sures", sureRepository.findByBid(bid));
		return map;
	}
	
	private void scrapingSureran(Map<String, Object> map, String bid) throws IOException{
		//まず板IDから板情報取得
		Board board = boardRepository.findById(bid);

		if(board == null) throw new IOException("板なし");
		map.put("board", board);
		
		//リクエスト情報構築
    	Request request = new Request.Builder()
        .url("http://" + board.getServer() + "." + board.getDomain() + "/" + board.getBoard() + "/subject.txt")
        .build();
    	
    	//DBにupsertする
    	Response response = client.newCall(request).execute();
    	final String resBody = new String(response.body().bytes(), "Shift_JIS");
    	response.body().close();
    	List<Sure> list = new ArrayList<>();
    	for (String line : resBody.split("\n")) {
    		Matcher m = Pattern.compile("(.+?)\\.dat<>(.+?)\\t\\s\\((.+?)\\)$").matcher(line);
    		if(m.find()) {
    			Sure sure = new Sure();
    			sure.setBid(board.getId());
    			sure.setDatNo(m.group(1));
    			sure.setLength(Integer.parseInt(m.group(3)));
    			sure.setSuretai(m.group(2));
    			list.add(sure);
    		}
		}
    	sureRepository.upsertBatch(list);
	}
	

}
