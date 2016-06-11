import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.myapp.App;
import com.myapp.domain.Sure;
import com.myapp.domain.itaran.Board;
import com.myapp.repository.BoardRepository;
import com.myapp.repository.SureRepository;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

/**
 * テストコード？
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = App.class)
public class ScrapingTest {
    @Autowired
    private BoardRepository repository;

    private static final String RANK_URL = "http://menu.2ch.net/bbsmenu.html";
    @Test
    public void mongoTest() throws IOException {
        List<Board> boards = new ArrayList<>();
        Document doc = Jsoup.connect(RANK_URL).get();
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
        System.out.println(boards);
        repository.saveBatch(boards);
        List<String> list = new ArrayList<>();
        list.add("なんでも実況J");
        System.out.println(repository.findByNames(list));
    }
    
    
    @Autowired
    SureRepository sureRepository;
    
    @Test
    public void nichanTest() throws IOException {
    	
    	Board board = repository.findById("57596bf7584cefc3dc6f1adf");
		OkHttpClient client = new OkHttpClient().newBuilder()
		.readTimeout(8 * 1000, TimeUnit.MILLISECONDS)
		.writeTimeout(8 * 1000, TimeUnit.MILLISECONDS)
		.connectTimeout(8 * 1000, TimeUnit.MILLISECONDS)
		.build();


    	Request request = new Request.Builder()
        .url("http://" + board.getServer() + "." + board.getDomain() + "/" + board.getBoard() + "/subject.txt")
        .build();
    	
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
