package com.myapp.domain;

import java.util.Date;
import java.util.List;

import org.springframework.data.annotation.Id;

import lombok.Data;

@Data
public class Dat {
	/** スレッドID */
	@Id
	private String id;
	private Integer byteLength;
	private String lastModified;
	private String title;
	/** デフォルトの名前 */
	private String name;
	/** 最後の更新日 */
	private Date lastUpdate;
	private boolean otiteru;
	private List<Res> resList;
	/** 通販情報リスト */
	private List<Tokka> tokkaList;
}
