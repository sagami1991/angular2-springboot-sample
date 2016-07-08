package com.myapp.repository;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

import java.util.List;
import java.util.stream.Collectors;

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
		
		List<String> datNoList = sures.stream()
				.map(Sure::getDatNo)
				.collect(Collectors.toList());
		
		//該当板を全てotiteruをtrueにする
		Update update = new Update();
		mongo.updateMulti(query(where("bid").is(boardId).and("otiteru").is(false))
				, update.set("otiteru", true), Sure.class, collection);
		
		//該当datnoに当てはまるものを取得
		List<Sure> oldSure = mongo.findAllAndRemove(
				query(where("bid").is(boardId).and("datNo").in(datNoList)),
				Sure.class
		);
		
		//重複するものをsuresのid書き換える
		List<String> datNoList2 = oldSure.stream()
		.map(Sure::getDatNo)
		.collect(Collectors.toList());
		for (Sure sure : sures) {
			final int idx = datNoList2.indexOf(sure.getDatNo());
			System.out.println(idx);
			if(idx != -1) sure.setId(oldSure.get(idx).getId());
		}
		mongo.insert(sures, collection);
		
	}
	
	
}
