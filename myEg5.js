eg.getDataList = function(min,max){//模拟构造数据，实际上这些数据由后端提供
	var lst = [],n=8;			//保存数据
	for(var i=0;i<n;i++){	//每次模拟n条
		var k = min + parseInt(Math.random()*(max-min));//随机指定范围的数
		lst.push(k+".jpg");	//拼接成字符串
	}
	return lst;				//返回数组
};
eg.cols = eg.getElementsByClassName("col");
eg.colH=[0,0,0,0];
eg.getColMin=function(){
	var min;
	var colObj={};
	for(var i=0;i<4;i++){
		min = parseInt(eg.cols[i].offsetHeight);
		colObj[min]=i;
		eg.colH[i]=min;
	}
	var colMin = Math.min.apply(Array,eg.colH);
	return eg.cols[colObj[colMin]||0];
}
eg.addEle = function(dl){
	for(var i in dl){
		var newDiv = document.createElement("div");
		var newImg = document.createElement("img");
		newImg.src = dl[i];
		newDiv.appendChild(newImg);
		var newP = document.createElement("p");
		newP.innerHTML = '<p>['+dl[i]+"]</p>"; 
		newDiv.appendChild(newP);
		eg.getColMin().appendChild(newDiv);
	}
}
eg.scroll=function(){
	eg.addListener(window,"scroll",function(){
		var scrT = document.documentElement.scrollTop||document.body.scrollTop;
		var cliH = document.documentElement.clientHeight||document.body.clientHeight;
		if(Math.min.apply(Array,eg.colH) < scrT+cliH+100){
			eg.addEle(eg.getDataList(1,35));
		}
	});
}