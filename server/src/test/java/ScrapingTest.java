import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.myapp.domain.BoardGenre;
import com.myapp.domain.ItaranBoard;
import com.myapp.repository.SettingRepository;
import com.myapp.repository.TeamRankRepository;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.myapp.App;
import com.myapp.domain.TeamRank;
import com.myapp.domain.Tyokin;

/**
 * テストコード？
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = App.class)
public class ScrapingTest {
    @Autowired
    private SettingRepository settingRepository;

    private static final String RANK_URL = "http://menu.2ch.net/bbsmenu.html";
    @Test
    public void mongoTest() throws IOException {
        List<BoardGenre> genres = new ArrayList<>();
        Document doc = Jsoup.connect(RANK_URL).get();
        final Elements elms = doc.select("a, b");
        for (Element elm: elms) {
            if(elm.tagName().equals("b")) {
                BoardGenre genre = new BoardGenre();
                genre.setName(elm.text());
                genre.setBoards(new ArrayList<>());
                genres.add(genre);
            }

            if(elm.tagName().equals("a") && genres.size() > 0){
                Matcher m = Pattern.compile("http://(.+?)\\.(.+?)/(.+?)/").matcher(elm.attr("href"));
                if(m.find()) {
                    ItaranBoard board = new ItaranBoard();
                    board.setName(elm.text());
                    board.setDomain(m.group(2));
                    board.setServer(m.group(1));
                    board.setBoard(m.group(3));
                    genres.get(genres.size() - 1).getBoards().add(board);
                }
            }
        }
        genres.remove(genres.size() - 1);
        System.out.println(genres);
        settingRepository.save(BoardGenre.id, genres);
    }

}
