package com.myapp;

import com.mongodb.Mongo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.web.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Created by m on 2016/05/29.
 */
@SpringBootApplication
@EnableScheduling
public class App extends SpringBootServletInitializer {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

    @Bean
    Mongo mongo() throws Exception {
        return new Mongo("localhost");
    }

    @Bean
    MongoTemplate mongoTemplate() throws Exception {
        return new MongoTemplate(mongo(), "yakiu");
    }
}
