package com.myapp.util;

import java.util.Arrays;
import java.util.List;

public class CommonUtil {
	public static List<String> strToList(String names){
		return Arrays.asList(names.split(","));
	}
}
