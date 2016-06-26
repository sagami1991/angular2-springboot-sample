package com.myapp.repository;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import com.myapp.domain.Sure;

@Repository
public class SureRepository {
	private static String collection = "sure";
	
	@Autowired
    MongoTemplate mongo;
	
	public Sure findById(String id) {
		Query q = query(where("id").is(id));
		return mongo.findOne(q, Sure.class, collection);
	}
	
	public List<Sure> findByBid(String boardId) {
		Query q = query(where("bid").is(boardId).and("otiteru").is(false));
		return mongo.find(q, Sure.class, collection);
	}
	
	public void upsertBatch(List<Sure> sures) {
		if(sures == null || sures.size() < 1) throw new RuntimeException("スレなし");
		String boardId = sures.get(0).getBid();
		List<String> datNoList = new ArrayList<>();
		for (Sure sure : sures) {
			datNoList.add(sure.getDatNo());
		}
		
		//ヒットしないものは過去ログフラグtrueにする
		Update update = new Update();
		update.set("otiteru", true);
		Query q = query(where("bid").is(boardId).and("datNo").in(datNoList).not());
		mongo.updateMulti(q, update, Sure.class, collection);
		
		//upsertめんどいから全部消して入れなおす
		Query q2 = query(where("bid").is(boardId).and("otiteru").is(false));
		mongo.remove(q2, collection);
		mongo.insert(sures, collection);
		
	}
	
	
}
