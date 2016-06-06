package com.myapp.controller;

import java.net.UnknownHostException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import com.myapp.config.AppConfig;

/**
 * Created by m on 2016/06/01.
 */
@Controller
public class MainController {
	@Autowired 
	private AppConfig appConfig;
	
    //angular2のroot機能使うために全てをindexに
    @RequestMapping({"/**"})
    public String index(Model model) throws UnknownHostException {
    	model.addAttribute(appConfig);
        return "index";
    }
}
