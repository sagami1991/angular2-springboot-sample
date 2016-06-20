package com.myapp.repository;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;

import com.myapp.domain.Tokka;

@Repository
public class TokkaRepository {
	
	private static String collection = "tokka";
	
	@Autowired
	MongoTemplate mongo;
	
	/** IDで取得 */
	public Tokka findById(String id) {
		return mongo.findOne(query(where("id").is(id)), Tokka.class, collection);
	}
	
	/** 新規追加 */
	public void insert(Tokka tokka) {
		mongo.insert(tokka, collection);
	}
	
	public void batchInsert(List<Tokka> tokkaList) {
		mongo.insert(tokkaList, collection);
	}
}
