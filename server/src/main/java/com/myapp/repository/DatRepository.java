package com.myapp.repository;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;

import com.mongodb.WriteResult;
import com.myapp.domain.Dat;
import com.myapp.util.CommonUtil;

/**
 * 
 * */
@Repository
public class DatRepository {
	private static String collection = "datfile";
	
	@Autowired
    MongoTemplate mongo;
	
	@Autowired
	CommonUtil commonUtil;
	
	public Dat findById(String id) {
		return mongo.findOne(query(where("id").is(id)), Dat.class, collection);
	}
	
	/** 新規追加 */
	public void insert(Dat dat) {
		mongo.insert(dat, collection);
	}
	
	/** 更新（差分更新時呼ばれる） */
	public void update(Dat dat) {
		WriteResult result = mongo.updateFirst(
				query(where("id").is(dat.getId())),
				commonUtil.createUpdate(dat),
				Dat.class, collection );
		System.out.println(result);
	}
}
