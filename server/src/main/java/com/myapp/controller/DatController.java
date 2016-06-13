package com.myapp.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.validation.constraints.NotNull;

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
import com.myapp.domain.itaran.Board;
import com.myapp.repository.BoardRepository;
import com.myapp.repository.DatRepository;
import com.myapp.repository.SettingRepository;
import com.myapp.repository.SureRepository;
import com.myapp.util.CommonUtil;

import okhttp3.FormBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Request.Builder;
import okhttp3.RequestBody;
import okhttp3.Response;

@RestController
@RequestMapping("api/dat")
public class DatController {
	private static final String APP_KEY = "JYW2J6wh9z8p8xjGFxO3M2JppGCyjQ";
	private static final String HM_KEY = "hO2QHdapzbqbTFOaJgZTKXgT2gWqYS";
	private static final String CT = "1234567890";
	private static final String HB = "e639a54671ccf9f839f0aee2a58fc7d5ad36b031a80611fd9e4409201fda8e69";
	private String sid;
	private boolean isOneRoop;
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
		if(sure == null) new RuntimeException("スレなし");
		
		//板情報取得
		Board board = boardRepository.findById(sure.getBid());
		if(board == null) new RuntimeException("板なし");
		Dat oldDat = datRepository.findById(sureId);
		//最近更新してるか、DBにdat落ちフラグ入ってる場合、そのまま返す
		if(oldDat != null && ( oldDat.isOtiteru() || CommonUtil.isRecentUp(oldDat.getLastUpdate()))){
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
    	System.out.println(response);
    	byte[] datfile = response.body().bytes();
    	response.body().close();
    	
    	switch (response.code()) {
    	//新規取得　gzipになっている
		case 200:
			Dat dat = new Dat();
			dat.setId(sureId);
			// 解凍
	    	datfile = CommonUtil.gzipDeCompress(datfile);
	    	//タイトル取得
	    	String[] lines = new String(datfile, "Shift_JIS").split("\n");
			Matcher m1 = Pattern.compile("^.+<>(.*?)(\\s\\[無断転載.+$|$)").matcher(lines[0]);
			dat.setTitle(m1.find()? m1.group(1) : null);
			//レスデータ作成
			dat.setResList(datToResList(lines));
			//ファイルサイズセット
			dat.setByteLength(datfile.length);
			//更新日セット
			dat.setLastModified(response.headers().get("Last-Modified"));
			//自分用更新日セット
			dat.setLastUpdate(new Date());
			datRepository.insert(dat);
			return createMap(board, sure, dat);
			// TODO ここはスレッド立てる
		//差分取得
		case 206:
			List<Res> list = datToResList(new String(datfile, "Shift_JIS").split("\n"));
			oldDat.setByteLength(oldDat.getByteLength() + datfile.length);
			oldDat.getResList().addAll(list);
			//更新日セット
			oldDat.setLastModified(response.headers().get("Last-Modified"));
			datRepository.update(oldDat);
			return createMap(board, sure, oldDat);
			// TODO ここはスレッド立てる
		//更新なし
		case 304:
			
			return createMap(board, sure, oldDat);
		//dat落ち
		case 501:
			if(oldDat != null) {
				oldDat.setOtiteru(true);
				datRepository.update(oldDat);
			}
			return createMap(board, sure, oldDat);
		//sid期限切れ
		case 401:
			if(isOneRoop == false){
				isOneRoop = true;
				setSidAndSaveDB();
				return getAllRes(sureId);
			}else{
				throw new RuntimeException("sidとれない");
			}
			
		default:
			throw new RuntimeException(response.toString());
		}
	}
	
    @ResponseStatus(value = HttpStatus.NOT_IMPLEMENTED, reason = "dat落ち")
    private class OtiteruException extends RuntimeException {}
    
    @ResponseStatus(value = HttpStatus.NOT_MODIFIED, reason = "更新なし")
    private class NotModifiedException extends RuntimeException {}
	
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
			// TODO 別スレッドで
			settingRepository.save("sid", sid);
			this.sid = sid;
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
    /** datの文章をレスリストに変換 */
    private List<Res> datToResList(String[] datLines) {
		List<Res> list = new ArrayList<>();
		Pattern p = Pattern.compile("^(.*)<>(.*)<>(.*)\\sID:(.*?)(\\s.*<>|<>)\\s(.*)<>");
        for (String line : datLines) {
    		Matcher m = p.matcher(line);
        	if(m.find()){
        		Res res = new Res();
        		res.setMail(m.group(2));
        		res.setPostDate(m.group(3));
        		res.setId(m.group(4));
        		res.setHonbun(m.group(6).replace("<br>", "\n").replaceAll("<a.+>&gt;&gt;([0-9]{1,4})</a>", ">>$1"));
        		list.add(res);
        	}
		}
        return list;
    }
	
}
