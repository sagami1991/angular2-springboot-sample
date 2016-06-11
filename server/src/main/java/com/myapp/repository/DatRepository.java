package com.myapp.repository;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import com.myapp.domain.Dat;

/**
 * DBにdatファイルそのままつっこむ
 * */
@Repository
public class DatRepository {
	private static String collection = "datfile";
	
	@Autowired
    MongoTemplate mongo;
	
	public Dat findById(String id) {
		return mongo.findOne(query(where("id").is(id)), Dat.class, collection);
	}
	
	/** 新規追加 */
	public void insert(Dat dat) {
		mongo.insert(dat, collection);
	}
	
	/** 更新 */
	public void update(Dat dat) {
		Update update = new Update();
		update.set("file", dat.getFile());
		mongo.updateFirst(query(where("id").is(dat.getId())), update, collection );
		
	}
}
