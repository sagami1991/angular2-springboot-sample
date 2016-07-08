package com.myapp.controller;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.validation.constraints.NotNull;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.myapp.domain.Dat;
import com.myapp.domain.Res;
import com.myapp.domain.Sure;
import com.myapp.domain.Tokka;
import com.myapp.domain.itaran.Board;
import com.myapp.repository.BoardRepository;
import com.myapp.repository.DatRepository;
import com.myapp.repository.SettingRepository;
import com.myapp.repository.SureRepository;
import com.myapp.repository.TokkaRepository;
import com.myapp.util.CommonUtil;
import com.myapp.util.SignedRequestsHelper;

import okhttp3.FormBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Request.Builder;
import okhttp3.RequestBody;
import okhttp3.Response;

@RestController
@RequestMapping("api/dat")
public class DatController {
	private static final Logger logger = LoggerFactory.getLogger(DatController.class);
	private static final String APP_KEY = "JYW2J6wh9z8p8xjGFxO3M2JppGCyjQ";
	private static final String HM_KEY = "hO2QHdapzbqbTFOaJgZTKXgT2gWqYS";
	private static final String CT = "1234567890";
	private static final String HB = "e639a54671ccf9f839f0aee2a58fc7d5ad36b031a80611fd9e4409201fda8e69";
	private String sid;
	private boolean isPass401;
	@Autowired
	BoardController boardController;
	@Autowired
	BoardRepository boardRepository;
	
	@Autowired
	SureRepository sureRepository;
	
	@Autowired
	DatRepository datRepository;
	
	@Autowired
    SettingRepository settingRepository;
	
	@Autowired
	OkHttpClient client;
	
	/** レスを取得（全レス返すが、DBには残ってる可能性ある） 
	 * @throws IOException */
	@RequestMapping(value = "/sid/{sid}")
	public Map<String, Object> getAllRes(@PathVariable("sid") @NotNull String sureId) throws IOException{
		//スレ情報取得
		Sure sure = sureRepository.findById(sureId);
		if(sure == null) throw new RuntimeException("対象のスレが存在しません" + sureId);
		logger.info("sureId {}",sureId);
		//板情報取得
		Board board = boardRepository.findById(sure.getBid());
		if(board == null) throw new RuntimeException("板なし");
		boardController.fetchDefaultName(board);
		
		Dat oldDat = datRepository.findById(sureId);
		//最近更新してるか、DBにdat落ちフラグ入ってる場合、そのまま返す
		if(oldDat != null && ( oldDat.isOtiteru() || CommonUtil.isRecentUp(oldDat.getLastUpdate()))){
			logger.info("最近取得しているので、スクレイピングせずにそのままDBの値返す");
			return createMap(board, sure, oldDat);
		}
		String uri = "/v1/"+board.getServer()+"/"+board.getBoard()+"/"+sure.getDatNo();
		String hobo = CommonUtil.geneKey(uri + sid + APP_KEY,HM_KEY);
		RequestBody formBody = new FormBody.Builder()
                .add("sid", sid)
                .add("hobo", hobo)
                .add("appkey", APP_KEY)
                .build();
		Builder headers = new Request.Builder()
    			.addHeader("User-Agent", "Mozilla/3.0 (compatible; JaneStyle/3.83)")
    			.addHeader("Accept-Encoding", "gzip")
    			.url("https://api.2ch.net" + uri)
    			.post(formBody);
		if(oldDat != null) {
			//自分用更新日セット
			oldDat.setLastUpdate(new Date());
			headers.addHeader("Range", "bytes=" + oldDat.getByteLength() + "-");
	    	headers.addHeader("If-Modified-Since", oldDat.getLastModified());
		}
		
		Request req = headers.build();
		Response response = client.newCall(req).execute();
		logger.info("dat取得 {}", response);
    	byte[] datfile = response.body().bytes();
    	response.body().close();
    	
    	Map<String, Object> resMap;
    	
    	switch (response.code()) {
    	//新規取得 gzipになっている
		case 200:
			Dat dat = new Dat();
			dat.setId(sureId);
			// 解凍
	    	datfile = CommonUtil.gzipDeCompress(datfile);
	    	//タイトル取得
	    	String[] lines = new String(datfile, "Shift_JIS").split("\n");
			Matcher m1 = Pattern.compile("^.+<>(.*?)(\\s\\[無断転載.+$|$)").matcher(lines[0]);
			dat.setTitle(m1.find()? m1.group(1) : null);
			//レスリストと特価リストをセット
			setResAndTokka(dat, lines);
			//ファイルサイズセット
			dat.setByteLength(datfile.length);
			//更新日セット
			dat.setLastModified(response.headers().get("Last-Modified"));
			//自分用更新日セット
			dat.setLastUpdate(new Date());
			datRepository.insert(dat);
			resMap = createMap(board, sure, dat);
			break;
			// TODO ここはスレッド立てる
		//差分取得(gzipではない)
		case 206:
			//レスリストと特価リストをセット
			setResAndTokka(oldDat, new String(datfile, "Shift_JIS").split("\n"));
			oldDat.setByteLength(oldDat.getByteLength() + datfile.length);
			//更新日セット
			oldDat.setLastModified(response.headers().get("Last-Modified"));
			datRepository.update(oldDat);
			resMap = createMap(board, sure, oldDat);
			break;
			// TODO ここはスレッド立てる
		//更新なし
		case 304:
			resMap = createMap(board, sure, oldDat);
			break;
		//dat落ち
		case 501:
			if(oldDat != null) {
				oldDat.setOtiteru(true);
				datRepository.update(oldDat);
			}
			resMap = createMap(board, sure, oldDat);
			break;
		//sid期限切れ
		case 401:
			//ここは一度しか通らないようにする
			if(!isPass401){
				isPass401 = true;
				setSidAndSaveDB();
				resMap = getAllRes(sureId);
			}else{
				throw new RuntimeException("sidとれない");
			}
			break;
			
		default:
			throw new RuntimeException(response.toString());
		}
    	isPass401 = false;
    	return resMap;
	}
	
    @ResponseStatus(value = HttpStatus.NOT_IMPLEMENTED, reason = "dat落ち")
    private class OtiteruException extends RuntimeException {
		private static final long serialVersionUID = 1L;
	}
    
    @ResponseStatus(value = HttpStatus.NOT_MODIFIED, reason = "更新なし")
    private class NotModifiedException extends RuntimeException {
		private static final long serialVersionUID = 1L;
	}
	
	/** 差分更新 
	 * @throws IOException */
	@RequestMapping(value = "/sabun/{sid}")
	private List<Res> getSabun(
			@PathVariable("sid") @NotNull String sureId,
			@RequestParam("length") @NotNull Integer length)
			throws IOException {
		Dat dat = (Dat) getAllRes(sureId).get("dat");
		
		List<Res> list = dat.getResList();
		if(dat.isOtiteru()) throw new OtiteruException();
		if(length == list.size()) throw new NotModifiedException();
		return list.subList(length, list.size());
	}
	
	/**
	 * 特価取得
	 * */
	@RequestMapping(value = "/tokka")
	private Tokka fetchTokka(@RequestParam("id") String url,
			@RequestParam("site") String siteName) {
		List<String> list = new ArrayList<>();
		list.add(url);
		List<Tokka> tokkaList = createTokkaList(list);
		if(tokkaList == null ) throw new RuntimeException("amazonから取得できない");
		return tokkaList.get(0);
	}
	
	/** board, sure, datをmapに入れて返す */
	private Map<String, Object> createMap(Board board, Sure sure, Dat dat){
		Map<String, Object> map= new HashMap<>();
		map.put("board", board);
		map.put("sure", sure);
		map.put("dat", dat);
		return map;
	}
	
	/** sid取得してDBに格納と、フィールド変数にセット */
	public void setSidAndSaveDB(){
		RequestBody formBody = new FormBody.Builder()
                .add("KY", APP_KEY)
                .add("CT", CT)
                .add("HB", HB)
                .build();
		
		Request req = new Request.Builder()
    			.addHeader("X-2ch-UA", "JaneStyle/3.83")
    			.url("https://api.2ch.net/v1/auth/")
    			.post(formBody)
    			.build();
		try {
			Response response = client.newCall(req).execute();
			final String sid = response.body().string().split(":")[1];
			response.body().close();
			// DB保存する必要性なくなってきたためやめる
			// settingRepository.save("sid", sid);
			this.sid = sid;
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
    /** レスリストと通販リストをdatオブジェクトにセット */
    private void setResAndTokka(Dat dat, String[] datLines) {
		List<Res> resList = new ArrayList<>();
//		List<String> tokkaUrlList = new ArrayList<>();
		Pattern p = Pattern.compile("^(.*)<>(.*?)<>(.+)\\s(ID:)?(.*)(\\s.*)?<>\\s(.*)<>");
//		Pattern amaP = Pattern.compile("www\\.amazon\\.co\\.jp.+?(B0........)");
        for (String line : datLines) {
    		Matcher m = p.matcher(line);
        	if(m.find()){
        		Res res = new Res();
        		res.setMail(m.group(2));
        		res.setPostDate(m.group(3));
        		res.setId(m.group(5));
        		res.setHonbun(m.group(7).replaceAll("<br> ", "\n").replaceAll("<a.+>&gt;&gt;([0-9]{1,4})</a>", "&gt;&gt;$1"));
        		resList.add(res);
        		
        		//本文に通販URL含まれていたらスクレイピング
//        		Matcher amaM = amaP.matcher(m.group(6));
//        		while(amaM.find()){
//        			tokkaUrlList.add("www.amazon.co.jp/dp/" + amaM.group(1));
//        		}
        	}
		}
        //List<Tokka> tokkaList = createTokkaList(tokkaUrlList);
        //差分更新と新着更新の場合で分ける
        if(dat.getResList() != null) dat.getResList().addAll(resList);
        else dat.setResList(resList);
//        if(dat.getTokkaList() != null) dat.getTokkaList().addAll(tokkaList);
//        else dat.setTokkaList(tokkaList);
        return;
    }
    
    @Autowired
    TokkaRepository tokkaRepository;
    
    /** 特価リストを作る  TODO リストをやめて単体に*/
	private List<Tokka> createTokkaList(List<String> urlList) {
		//重複削除
		urlList = new ArrayList<>( new HashSet<>(urlList));
		List<Tokka> tokkaList = new ArrayList<>();
		final List<String> AsinList = new ArrayList<>();
		final Pattern p = Pattern.compile("www.amazon.co.jp/dp/(B0........)");
		
		for (String url : urlList) {
			Tokka tokka = tokkaRepository.findById(url);
			if(tokka == null){
				Matcher m = p.matcher(url);
				m.find();
				AsinList.add(m.group(1));
			} else {
				tokkaList.add(tokka);
			}
		}
		
		// アマゾンAPI叩く TODO ここらへん整理
		if(AsinList.size() == 0){
			return tokkaList;
		}
		
        try {
        	SignedRequestsHelper helper = SignedRequestsHelper.getInstance("webservices.amazon.co.jp", "AKIAIEUE7ZHSDHQMBJHQ", "cYN6cC9LqfI4BJQtOKreNAZnNi23imJfSzz7Gu+A");
	        
        	Map<String, String> params = new HashMap<String, String>();
	        params.put("Service", "AWSECommerceService");
	        params.put("Operation", "ItemLookup");
	        params.put("AWSAccessKeyId", "AKIAIEUE7ZHSDHQMBJHQ");
	        params.put("AssociateTag", "saito8485-22");
	        params.put("ItemId", String.join(",", AsinList));
	        params.put("IdType", "ASIN");
	        params.put("ResponseGroup", "Images,ItemAttributes");
	
			OkHttpClient client = new OkHttpClient();
			Request req = new Request.Builder()
	    			.url(helper.sign(params))
	    			.build();
			Response response = client.newCall(req).execute();
			Document document = Jsoup.parse(response.body().string());
			response.body().close();
			List<Tokka> newTokkaList = new ArrayList<>();
			for (Element item : document.select("Item")) {
				Tokka tokka = new Tokka();
				tokka.setId("www.amazon.co.jp/dp/" + item.select("asin").text());
				try{
					tokka.setTitle(item.select("ItemAttributes > Title").text());
					tokka.setPrice(Integer.parseInt(item.select("ItemAttributes > ListPrice > Amount").text()));
					tokka.setImgUrl(item.select("> SmallImage > URL").text());
				} catch (NumberFormatException | NullPointerException e) {
					logger.error("amazonでエラー 取れない {}", item.select("ItemAttributes"));
				}
				tokka.setSiteName("amazon");
				tokkaList.add(tokka);
				newTokkaList.add(tokka);
				logger.info("amazonから商品情報取得 {}", tokka);
			}
			tokkaRepository.batchInsert(newTokkaList);
			return tokkaList;
		} catch (IOException | InvalidKeyException | IllegalArgumentException | NoSuchAlgorithmException e) {
			e.printStackTrace();
			return tokkaList;
		}
		
	}
}
