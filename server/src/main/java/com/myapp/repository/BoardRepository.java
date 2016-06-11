package com.myapp.repository;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import com.myapp.domain.itaran.Board;

@Repository
public class BoardRepository {
	private static String collection = "boards";
	@Autowired
    MongoTemplate mongo;
	
	public List<Board> findByNames(List<String> nameList) {
		return mongo.find(query(where("name").in(nameList)), Board.class, collection);
	}
	
	public Board findById(String id) {
		return mongo.findOne(query(where("id").in(id)), Board.class, collection);
	}
	
	public void saveBatch(List<Board> boards) {
		mongo.remove(new Query(), collection);
		mongo.insert(boards, collection);
	}
	
}
