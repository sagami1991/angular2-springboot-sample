import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.xml.parsers.ParserConfigurationException;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.junit.Test;
import org.xml.sax.SAXException;

import com.myapp.domain.Tokka;
import com.myapp.util.SignedRequestsHelper;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

/**
 * テストコード？
 */
//@RunWith(SpringJUnit4ClassRunner.class)
//@SpringApplicationConfiguration(classes = App.class)
public class ScrapingTest {
	
	@Test
	public void amazon() throws IOException, SAXException, ParserConfigurationException {

        SignedRequestsHelper helper;

        try {
            helper = SignedRequestsHelper.getInstance("webservices.amazon.co.jp", "AKIAIEUE7ZHSDHQMBJHQ", "cYN6cC9LqfI4BJQtOKreNAZnNi23imJfSzz7Gu+A");
        } catch (Exception e) {
            e.printStackTrace();
            return;
        }
        
        Map<String, String> params = new HashMap<String, String>();

        params.put("Service", "AWSECommerceService");
        params.put("Operation", "ItemLookup");
        params.put("AWSAccessKeyId", "AKIAIEUE7ZHSDHQMBJHQ");
        params.put("AssociateTag", "saito8485-22");
        params.put("ItemId", "B015B8CR0Q,B01H03FP04");
        params.put("IdType", "ASIN");
        params.put("ResponseGroup", "Images,ItemAttributes");

		OkHttpClient client = new OkHttpClient();
		Request req = new Request.Builder()
    			.url(helper.sign(params))
    			.build();
		Response response = client.newCall(req).execute();
		
		Document document = Jsoup.parse(response.body().string());
		for (Element item : document.select("Item")) {
			Tokka tokka = new Tokka();
			tokka.setId("www.amazon.co.jp/dp/" + item.select("> ASIN").text());
			tokka.setPrice(Integer.parseInt(item.select("ItemAttributes > ListPrice > Amount").text()));
			tokka.setTitle(item.select("ItemAttributes > Title").text());
			tokka.setImgUrl(item.select("> SmallImage > URL").text());
			tokka.setSiteName("amazon");
			System.out.println(tokka);
		}
		
		
	}
}
