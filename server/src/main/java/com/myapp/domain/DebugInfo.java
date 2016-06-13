package com.myapp.domain;

import lombok.Data;

@Data
public class DebugInfo {
	private double totalMem;
	private double useMem;
	private double perMem;
	private double totalSpace;
	private double freeSpace;
	private double perSpace;
	
	//桁数揃える
	public void round() {
		this.totalMem = (double)((int)(this.totalMem * 100)) / 100;
		this.useMem = (double)((int)(this.useMem * 100)) / 100;
		this.perMem = (double)((int)(this.perMem * 100)) / 100;
		this.totalSpace = (double)((int)(this.totalSpace * 100)) / 100;
		this.freeSpace = (double)((int)(this.freeSpace * 100)) / 100;
		this.perSpace = (double)((int)(this.perSpace * 100)) / 100;
	}
}
