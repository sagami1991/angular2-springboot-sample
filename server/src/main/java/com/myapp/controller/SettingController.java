package com.myapp.controller;

import java.io.File;
import java.lang.management.ManagementFactory;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myapp.domain.DebugInfo;
import com.myapp.domain.itaran.BoardGenre;
import com.myapp.domain.yakiu.TeamRank;
import com.myapp.repository.SettingRepository;
import com.sun.management.OperatingSystemMXBean;

@SuppressWarnings("restriction")
@RestController
@RequestMapping("api/setting")
public class SettingController {
	public static String osName;
	
	@Autowired
	private SettingRepository repository;
	
	/** 全板返す？ */
	@RequestMapping(BoardGenre.id)
	public BoardGenre get() {
		return repository.fetchSetting(BoardGenre.class, BoardGenre.id);
	}
	
	/** デバッグ情報返す */
	@RequestMapping("debug")
	public DebugInfo getDebug(){
		DebugInfo info = new DebugInfo();
		OperatingSystemMXBean system = (OperatingSystemMXBean) ManagementFactory
				.getOperatingSystemMXBean();
		info.setOsName(osName);
		long totalMem = system.getTotalPhysicalMemorySize();
		long freeMem = system.getFreePhysicalMemorySize();
		info.setTotalMem(totalMem / (int)Math.pow(1024, 2));
		info.setUseMem((info.getTotalMem() - freeMem / (int)Math.pow(1024, 2)));
		info.setPerMem((double)info.getUseMem() / info.getTotalMem() * 100);
		File file = new File("/");
		info.setTotalSpace((double)file.getTotalSpace() / Math.pow(1024, 3));
		info.setFreeSpace((double)file.getFreeSpace() / Math.pow(1024, 3));
		info.setPerSpace((info.getTotalSpace() - info.getFreeSpace())/info.getTotalSpace());
		info.round();
		return info;
	}
	
	/** やきうランキング返す */
	@SuppressWarnings("unchecked")
	@RequestMapping("yakiu")
	public List<TeamRank> getYakiuRanking() {
		return repository.fetchSetting(List.class, TeamRank.collection);
	}
	
}
