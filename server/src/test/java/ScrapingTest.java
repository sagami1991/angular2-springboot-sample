import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
    TeamRankRepository repository;

    @Value("${spring.profiles}")
    private String profile;

    @Test
    public void mongoTest() {
        System.out.println(profile);
        System.out.println(repository.findLastUpdated("ce"));
    }

}
//enumのつくりかた
enum Team {
    G("巨人"),
    T("阪神"),
    C("広島"),
    DB("横浜"),
    D("中日"),
    S("東京"),
    H("便器"),
    M("千葉"),
    F("日公"),
    L("西武"),
    Bs("檻牛"),
    E("楽天");


    private String label;

    Team(String label) {
        this.label = label;
    }

    public String getLabel() {
        return this.label;
    }
}
