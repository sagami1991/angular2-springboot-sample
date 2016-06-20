package com.myapp.controller;

import static com.myapp.util.CommonUtil.strToList;

import java.io.IOException;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.myapp.domain.itaran.Board;
import com.myapp.repository.BoardRepository;
import com.myapp.util.CommonUtil;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

@RestController
@RequestMapping("api/boards")
public class BoardController {
	private static final Logger logger = LoggerFactory.getLogger(BoardController.class);

	@Autowired
	BoardRepository boardRepository;
	@Autowired
	OkHttpClient client;
	@Autowired
	private BoardRepository repository;
	
	/** 板名リスト受け取ってリストで返す */
	// TODO 並び替え
	@RequestMapping("bynames")
	public List<Board> findByNames(@RequestParam("names") String names) {
		return repository.findByNames(strToList(names));
	}
	
	/** デフォルト名前取得するためにsetting.txt取得 */
	public void fetchDefaultName(Board board) {
		if(board.getDefaultName() != null && !board.getDefaultName().equals("")){
			return;
		}
		Request request = new Request.Builder()
				.addHeader("User-Agent", CommonUtil.CHROME_UA)
				.addHeader("Accept-Encoding", "gzip")
				.url("http://" + board.getServer() + "." + board.getDomain() + "/" + board.getBoard() + "/SETTING.TXT")
		        .build();
		try {
			Response response = client.newCall(request).execute();
			byte[] bodyByte = CommonUtil.gzipDeCompress(response.body().bytes());
			logger.info("デフォルト名前取得するためにsetting.txt取得", response);
			final String resBody = new String(bodyByte, "Shift_JIS");
			response.body().close();
			Matcher m = Pattern.compile("BBS_NONAME_NAME=(.+?)\n").matcher(resBody);
			board.setDefaultName(m.find()? m.group(1) : "");
			// TODO 別スレッドで
			boardRepository.updateDefaultName(board);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
