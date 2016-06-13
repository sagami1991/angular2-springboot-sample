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
	// TODO このやりかたまずい
	private Date befCrawlTime = new Date();
	
	@RequestMapping(value = "/bid/{boardId}")
	public Map<String, Object> findByBid(@PathVariable("boardId") String bid) throws IOException {
		
		//前回より5秒経ってたらスクレイピングしてインサート
		if(new Date().getTime() - befCrawlTime.getTime() > 5*1000){
			return scrapingSureran(bid);
		}
		System.out.println("スレ一覧、スクレイピングせずにDBから取得");
		Map<String, Object> map = new HashMap<>();
		map.put("board", boardRepository.findById(bid));
		map.put("sures", sureRepository.findByBid(bid));
		return map;
	}
	
	private Map<String, Object> scrapingSureran(String bid) throws IOException{
		//まず板IDから板情報取得
		Board board = boardRepository.findById(bid);

		if(board == null) throw new IOException("板なし");
		//デフォルトの名前使うので
		if(board.getDefaultName() == null || board.getDefaultName().equals("")){
			Request request = new Request.Builder()
					.addHeader("User-Agent", "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.84 Safari/537.36")
			        .url("http://" + board.getServer() + "." + board.getDomain() + "/" + board.getBoard() + "/SETTING.TXT")
			        .build();
			Response response = client.newCall(request).execute();
			final String resBody = new String(response.body().bytes(), "Shift_JIS");
			response.body().close();
			Matcher m = Pattern.compile("BBS_NONAME_NAME=(.+?)\n").matcher(resBody);
			board.setDefaultName(m.find()? m.group(1) : "");
			// TODO 別スレッドで
			boardRepository.updateDefaultName(board);
		}
		
		//リクエスト情報構築
    	Request request = new Request.Builder()
    	.addHeader("User-Agent", "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.84 Safari/537.36")
        .url("http://" + board.getServer() + "." + board.getDomain() + "/" + board.getBoard() + "/subject.txt")
        .build();
    	
    	//DBにupsertする
    	Response response = client.newCall(request).execute();
    	System.out.println(response);
    	final String resBody = new String(response.body().bytes(), "Shift_JIS");
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
    	sureRepository.upsertBatch(list);
    	Map<String, Object> map = new HashMap<>();
    	map.put("board", board);
    	map.put("sures", list);
    	return map;
	}
	

}
