package com.myapp.util;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.zip.GZIPInputStream;

import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import javax.xml.bind.DatatypeConverter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;

@Component
public class CommonUtil {
	public static final String CHROME_UA = "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.84 Safari/537.36";
	public static final String JANE_UA = "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.84 Safari/537.36";

	
	@Autowired
    MongoTemplate mongo;
	
	/** 文章をカンマで区切ってListで返す */
	public static List<String> strToList(String names){
		return Arrays.asList(names.split(","));
	}
	
	/** 引数のDateが今より5秒以内だったらtrueを返す */
	public static boolean isRecentUp(Date lastUpdate){
		return lastUpdate != null && new Date().getTime() - lastUpdate.getTime() < 5*1000;
	}
	
	/** mongodbの更新オブジェクトをコピーして返す、ただしidは削除する */
	public <T> Update createUpdate(T fromObj){
		DBObject dbDoc = new BasicDBObject();
		mongo.getConverter().write(fromObj, dbDoc);
		dbDoc.removeField("_id");
		return Update.fromDBObject(dbDoc);
	}
	
	/**
	 * HmacSHA256認証キーの作成して16進数文字列で返す
	 * @param message 認証元の文字列
	 * @param signatureKey 認証キーを作成する署名キー
	 * @return 生成した認証キー
	 * @throws NoSuchAlgorithmException 存在しないアルゴリズムの場合throw
	 * @throws InvalidKeyException "Message Authentication Code" (MAC) algorithmに適さないKeyを指定するとthrow
	 */
	public static String geneKey(String message, String signatureKey){
		try{
		  // 秘密鍵の作成
		  SecretKey secretKey = new SecretKeySpec(signatureKey.getBytes(), "HmacSHA256");
		 
		  // 認証キーの作成
		  Mac mac = Mac.getInstance("HmacSHA256");
		  mac.init(secretKey);
		  mac.update(message.getBytes());
		   
		  // 暗号化
		  byte[] encryptedData = mac.doFinal();
		   
		  // バイト配列を16進数化
		  return DatatypeConverter.printHexBinary(encryptedData).toLowerCase();
		} catch(Exception e){
			e.printStackTrace();
			return null;
		}
	}
	
	/** gunzip */
	public static byte[] gzipDeCompress(byte[] from) throws IOException{
		GZIPInputStream in = new GZIPInputStream(new ByteArrayInputStream(from));
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		int len;
		byte[] buffer = new byte[1024];
		while ((len = in.read(buffer)) > 0) {
		    out.write(buffer, 0, len);
		}

		in.close();
		out.flush();
		out.close();
		return out.toByteArray();
	}
}
