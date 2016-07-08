package com.myapp.repository;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import com.myapp.domain.itaran.Board;
import com.myapp.util.CommonUtil;

@Repository
public class BoardRepository {
	private static String collection = "boards";
	@Autowired
    MongoTemplate mongo;
	
	@Autowired
	CommonUtil commonUtil;
	
	/** サーバー、ドメイン、板コンテキストパスを条件としたクエリ返す */
	private Query getQuery(Board board) {
		return query(
				where("server").is(board.getServer())
				.and("domain").is(board.getDomain())
				.and("board").is(board.getBoard())
				);
	}
	
	/** 全て取得 */
	public List<Board> findAll() {
		return mongo.findAll(Board.class, collection);
	}
	
	/** 板の名前で検索 */
	public List<Board> findByNames(List<String> nameList) {
		return mongo.find(query(where("name").in(nameList)), Board.class, collection);
	}
	/** idで検索 */
	public Board findById(String id) {
		return mongo.findOne(query(where("id").is(id)), Board.class, collection);
	}
	
	/** ドメイン、サーバー、コンテキストパスで検索 */
	public Board findByDomainAndServerAndBoard(Board board) {
		return mongo.findOne(getQuery(board), Board.class, collection);
	}
	
	/** もし存在しなかったらインサートする */
	public void upsertAll(List<Board> boards) {
		for (Board board : boards) {
			mongo.upsert(getQuery(board), commonUtil.createUpdate(board),  Board.class, collection);
		}
	}
	
	/** レスの名前を更新する */
	public void updateDefaultName(Board board){
		mongo.updateFirst(query(where("id").in(board.getId())), Update.update("defaultName", board.getDefaultName()), Board.class, collection);
	}
	
	/** 全フィールド更新 */
	public void update(Board board){
		mongo.updateFirst(query(where("id").in(board.getId())), commonUtil.createUpdate(board), Board.class, collection);

	}
	
}
