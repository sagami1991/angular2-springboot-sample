package com.myapp.cron;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.annotation.PostConstruct;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.myapp.controller.DatController;
import com.myapp.controller.SettingController;
import com.myapp.domain.itaran.Board;
import com.myapp.repository.BoardRepository;

/** 初回のみ実行 */
@Component
public class InitialExecute {
	@Autowired
	Environment env;
	
	@Autowired
	private DatController datController;
	
	@Autowired
    private BoardRepository boardRepository;
	
	/** 初回のみ実行 */
	@PostConstruct
	public void init(){
		//板ツリー更新
		scrapingBBSMenu();
		
		//sidをDBに格納
		datController.setSidAndSaveDB();
		
		//os名取得
		getOSName();
	}
    private static final String BBS_MENU_URL = "http://menu.2ch.net/bbsmenu.html";

    /** 全板をDBにupsert */
	private void scrapingBBSMenu() {
		try {
	        List<Board> boards = new ArrayList<>();
			Document doc = Jsoup.connect(BBS_MENU_URL).get();
	        final Elements elms = doc.select("a, b");
	        String genre = "";
	        for (Element elm: elms) {
	            if(elm.tagName().equals("b")) {
	                genre = elm.text();
	            }
	
	            if(elm.tagName().equals("a")){
	                Matcher m = Pattern.compile("http://(.+?)\\.(.+?)/(.+?)/").matcher(elm.attr("href"));
	                if(m.find()) {
	                    Board board = new Board();
	                    board.setGenre(genre);
	                    board.setName(elm.text());
	                    board.setDomain(m.group(2));
	                    board.setServer(m.group(1));
	                    board.setBoard(m.group(3));
	                    boards.add(board);
	                }
	            }
	        }
	        boardRepository.upsertAll(boards);	
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	/** OS名取得 */
	private void getOSName() {
		if(env.getActiveProfiles()[0].equals("dev")) {
			SettingController.osName = System.getProperty("os.name");
			return;
		}
		try {
			InputStream is = Runtime.getRuntime().exec("cat /etc/redhat-release").getInputStream();
			BufferedReader br = new BufferedReader(new InputStreamReader(is));
			SettingController.osName = br.readLine();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	
	
}
