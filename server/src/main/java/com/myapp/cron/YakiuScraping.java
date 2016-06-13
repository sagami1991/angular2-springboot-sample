package com.myapp.cron;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.myapp.domain.yakiu.TeamRank;
import com.myapp.domain.yakiu.Tyokin;
import com.myapp.repository.SettingRepository;

@Component
public class YakiuScraping {

    @Autowired
    private SettingRepository settingRepository;

    @Value("${spring.profiles}")
    private String profile;

    /** yahooのランキングurl */
    private static final String RANK_URL = "http://baseball.yahoo.co.jp/npb/standings/";
    private static final String CE_ID = "#sta_c";
    private static final String PA_ID = "#sta_p";
    private Document doc;

    /** 10分毎にスクレイピングする */
    @Scheduled(initialDelay = 1000, fixedRate = 10 * 60 * 1000)
    public void FetchRank() throws IOException {
//        if(profile.equals("dev")){
//            System.out.println("開発環境はスクレイピングしない");
//            return;
//        }
        doc = Jsoup.connect(RANK_URL).get();
        final List<TeamRank> list = new ArrayList<>();
        //セリーグ
        final TeamRank ceLeague = new TeamRank();
        ceLeague.setLeague("セリーグ");
        ceLeague.setRanking(fetchTyokin(CE_ID));
        ceLeague.setUpdated(fetchUpdated(CE_ID));
        list.add(ceLeague);
        
        //パリーグ
        final TeamRank paLeague = new TeamRank();
        paLeague.setLeague("パリーグ");
        paLeague.setRanking(fetchTyokin(PA_ID));
        paLeague.setUpdated(fetchUpdated(PA_ID));
        list.add(paLeague);
        System.out.println("やきうスクレイピング");
        settingRepository.save(TeamRank.collection, list);

    }

    /** チームごとの貯金とる */
    public List<Tyokin> fetchTyokin(String selector){
        List<Tyokin> list = new ArrayList<>();
        final Elements elms = doc.select(selector + " table.NpbPlSt.yjM tr");
        //一行目ヘッダなので抜かす
        elms.remove(0);
        for (Element elem : elms) {
            //球団コード
            final String teamCode = elem.select("td.lt.NpbLogo.yjM > a").attr("class");

            //勝数
            final int tyokin = Integer.parseInt(elem.select("td:nth-child(4)").text());
            final int syakkin =Integer.parseInt(elem.select("td:nth-child(5)").text());

            //チームオブジェクト作成
            final Tyokin team = new Tyokin();
            team.setName(teamCode);
            team.setTyokin(tyokin - syakkin);
            list.add(team);
        }
        return list;
    }

    /** 更新日時取る、正規表現や数値変換だけで冗長すぎ */
    Date fetchUpdated(String selector){
        final Element elm = doc.select(selector + " .left.yjMS").get(0);
        Pattern p = Pattern.compile("([0-9]{4})年([0-9]+)月([0-9]+)日\\s([0-9]+)時([0-9]+)分更新");
        Matcher m = p.matcher(elm.text());
        if(m.find()){
            return new GregorianCalendar(Integer.parseInt(m.group(1)), Integer.parseInt(m.group(2)) - 1,Integer.parseInt(m.group(3)),
                    Integer.parseInt(m.group(4)),Integer.parseInt(m.group(5))).getTime();
        }
        throw new RuntimeException("おかしい");
    }

}
