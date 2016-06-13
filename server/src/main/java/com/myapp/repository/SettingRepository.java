package com.myapp.repository;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;

import com.myapp.domain.Setting;

/**
 * Created by m on 2016/06/07.
 */
@Repository
public class SettingRepository {
	private static String collection = "setting";
    @Autowired
    MongoTemplate mongo;

    public void save(String _id, Object obj){
        mongo.save(new Setting<>(_id, obj), collection);
    }

    public <T> T fetchSetting(Class<T> classType, String id){
    	@SuppressWarnings("unchecked")
		Setting<T> setting = mongo.findOne(query(where("id").is(id)), Setting.class, collection);
    	return setting.getData();
    }

}
