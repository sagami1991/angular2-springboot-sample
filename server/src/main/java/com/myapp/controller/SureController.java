package com.myapp.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myapp.domain.Sure;
import com.myapp.domain.itaran.Board;
import com.myapp.repository.BoardRepository;
import com.myapp.repository.SureRepository;
import com.myapp.util.CommonUtil;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

@RestController
@RequestMapping("api/sureran")
public class SureController {
	private static final Logger logger = LoggerFactory.getLogger(SureController.class);
	@Autowired
	BoardRepository boardRepository;
	@Autowired
	SureRepository sureRepository;
	@Autowired
	OkHttpClient client;
	@Autowired
	BoardController boardController;
	
	@RequestMapping(value = "/bid/{boardId}")
	public Map<String, Object> findByBid(@PathVariable("boardId") String bid) throws IOException {
		Board board = boardRepository.findById(bid);
		if(board == null) throw new RuntimeException("板なし");
		Map<String, Object> map = new HashMap<>();
		
		if(!CommonUtil.isRecentUp(board.getLastUpdate())){
			map = scrapingSureran(board);
		} else {
			logger.info("スレ一覧、スクレイピングせずにDBから取得");
			map.put("board", boardRepository.findById(bid));
			map.put("sures", sureRepository.findByBid(bid));
		}
		return map;
	}
	
	private Map<String, Object> scrapingSureran(Board board) throws IOException{
		boardController.fetchDefaultName(board);
		
		//スレ一覧取得用リクエスト情報構築
    	Request request = new Request.Builder()
    	.addHeader("User-Agent", CommonUtil.CHROME_UA)
    	.addHeader("Accept-Encoding", "gzip")
        .url("http://" + board.getServer() + "." + board.getDomain() + "/" + board.getBoard() + "/subject.txt")
        .build();
    	
    	//DBにupsertする
    	Response response = client.newCall(request).execute();
    	byte[] bodyByte = CommonUtil.gzipDeCompress(response.body().bytes());
    	logger.info("subject.txt取得 {} {}", request, response);
    	final String resBody = new String(bodyByte, "Shift_JIS");
    	response.body().close();
    	List<Sure> list = new ArrayList<>();
    	Pattern p = Pattern.compile("(.+?)\\.dat<>(.+?)\\t\\s(\\[[0-9]{0,9}\\]\\s|)\\((.+?)\\)$");
    	for (String line : resBody.split("\n")) {
    		Matcher m = p.matcher(line);
    		if(m.find()) {
    			Sure sure = new Sure();
    			sure.setBid(board.getId());
    			sure.setDatNo(m.group(1));
    			sure.setLength(Integer.parseInt(m.group(4)));
    			sure.setSuretai(m.group(2));
    			list.add(sure);
    		}
		}
    	//TODO 別スレッドで
    	board.setLastUpdate(new Date());
    	sureRepository.upsertBatch(list);
    	boardRepository.update(board);
    	
    	Map<String, Object> map = new HashMap<>();
    	map.put("board", board);
    	map.put("sures", list);
    	return map;
	}
	

}
