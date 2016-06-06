package com.myapp.repository;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.myapp.domain.TeamRank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

/**
 * Created by m on 2016/06/04.
 */
@Repository
public class TeamRankRepository {
    @Autowired
    MongoTemplate mongo;

    private Update getUpdateObjFromRank(TeamRank rank) {
        DBObject dbDoc = new BasicDBObject();
        mongo.getConverter().write(rank, dbDoc);
        dbDoc.removeField("_id");
        return Update.fromDBObject(dbDoc);
    }

    /** スクレイピングしたランキング情報をDBにupsert */
    public void upsertByUpdatedAndType(TeamRank team) {
        Query query = new Query(Criteria.where("type").is(team.getType()).and("updated").is(team.getUpdated()));
        Update update = getUpdateObjFromRank(team);
        mongo.upsert(query, update, TeamRank.class);
    }

    /** 指定したリーグの最終更新時間のランキング情報を取得 */
    public TeamRank findLastUpdated(String leagueType){
        Query query = new Query(Criteria.where("type").is(leagueType))
                .limit(1).with(new Sort(Sort.Direction.DESC, "updated"));
        return mongo.findOne(query, TeamRank.class);
    }
}
