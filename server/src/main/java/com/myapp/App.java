package com.myapp;

import java.util.concurrent.TimeUnit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.web.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.mongodb.Mongo;

import okhttp3.OkHttpClient;

/**
 * Created by m on 2016/05/29.
 */
@SpringBootApplication
@EnableScheduling
public class App extends SpringBootServletInitializer {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

    @SuppressWarnings("deprecation")
	@Bean
    Mongo mongo() throws Exception {
        return new Mongo("localhost");
    }

    @Bean
    MongoTemplate mongoTemplate() throws Exception {
        return new MongoTemplate(mongo(), "nichan");
    }
    
    @Bean
	OkHttpClient client(){
    	return new OkHttpClient().newBuilder()
		.readTimeout(8 * 1000, TimeUnit.MILLISECONDS)
		.writeTimeout(8 * 1000, TimeUnit.MILLISECONDS)
		.connectTimeout(8 * 1000, TimeUnit.MILLISECONDS)
		.build();
    }
}
