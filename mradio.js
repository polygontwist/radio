var mradio=function(zielid){
	/*
		Ansteuerung eines Majority Radio per Web
	*/
	var mainIP="http://192.168.0.41/"
	var maincommant="httpapi.asp?"
	var gethelper="get.php?url=";
	
	//------------vars----------
	var radiodata={
		'vol':0
	}
	
	
	//------------Basics----------
	var htmlloader=function(url,refunc,errorFunc){
		var loader;
		try{
			loader = new XMLHttpRequest();
		}
		catch(e) {
			try {                        
				loader  = new ActiveXObject("Microsoft.XMLHTTP");// MS Internet Explorer (ab v6)
			} 
			catch(e){
				try {                                
						loader  = new ActiveXObject("Msxml2.XMLHTTP");// MS Internet Explorer (ab v5)
				} catch(e) {
						loader  = null;
						console.log('XMLHttp nicht möglich.');
				}
			}
		}
		var startloading=function(isreload){
			if(loader!=null){
				var u=url;
				if(isreload){
					u+='&reload=true';
				}
				loader.open('GET',u,true);//open(method, url, async, user, password)
				loader.responseType='text'; //!                
				loader.setRequestHeader('Content-Type', 'text/plain'); 
				loader.setRequestHeader('Cache-Control', 'no-cache'); 
				loader.setRequestHeader('Access-Control-Allow-Headers', '*');
				loader.setRequestHeader('Access-Control-Allow-Origin', '*');
				loader.onreadystatechange = function(e){                
					if (this.readyState == 4) {
						if(loader.status!=200){}
					}
				};
				loader.onload=function(e){
					if(typeof refunc==="function")refunc(this.responseText);
				}				
				loader.onabort = loader.onerror = function(e){
					if(typeof errorFunc==="function")errorFunc(e);
				}
				// loader.timeout=  //ms
				loader.send(null);
 
			}
		}
		//--API--
		this.reload=function(){
			startloading(true);
		}
 
		startloading(false);
	}
	var parseJSON=function(s){
		var re={};
		if(s=="undefined")s="{}";
		if(s==undefined)s="{}";
		if(s==null)s="{}";
		s=s.split("\n").join('').split("\r").join('').split("\t").join('');	
		s=s.split("'").join('"');	//passend formatieren ' -> "
		try{
			re=JSON.parse(s);
		}
		catch(err) {
			console.log("JSONfehler",err.message,{"s":s});
			re={};
		}
		return re;
	}
	var JSONistemty=function(obj){
		for(var key in obj){
			return false; // not empty
		}
		return true; // empty
	}
	
	var cE=function(ziel,e,id,cn){
		var newNode=document.createElement(e);
		if(id!=undefined && id!="")newNode.id=id;
		if(cn!=undefined && cn!="")newNode.className=cn;
		if(ziel)ziel.appendChild(newNode);
		return newNode;
		}
	var gE=function(id){
		if(id=="")return undefined; else return document.getElementById(id);
	}
	var addClass=function(htmlNode,Classe){	
		var newClass;
		if(htmlNode!=undefined){
			newClass=htmlNode.className;
	 
			if(newClass==undefined || newClass=="")newClass=Classe;
			else
			if(!istClass(htmlNode,Classe))newClass+=' '+Classe;	
	 
			htmlNode.className=newClass;
		}			
	}
	var subClass=function(htmlNode,Classe){
			var aClass,i;
			if(!istClass(htmlNode,Classe))return;
			if(htmlNode!=undefined && htmlNode.className!=undefined){
				aClass=htmlNode.className.split(" ");	
				var newClass="";
				for(i=0;i<aClass.length;i++){
					if(aClass[i]!=Classe){
						if(newClass!="")newClass+=" ";
						newClass+=aClass[i];
						}
				}
				htmlNode.className=newClass;
			}
	}
	var istClass=function(htmlNode,Classe){
		if(htmlNode.className){
			var i,aClass=htmlNode.className.split(' ');
			for(i=0;i<aClass.length;i++){
					if(aClass[i]==Classe)return true;
			}	
		}		
		return false;
	}
	
	//----------------------------
	var sendPlayerCmd=function(data ,refunc,errorfunc){
		var url=gethelper+mainIP+maincommant+data;
		if(refunc==undefined)refunc=CmdRe;
		if(errorfunc==undefined)errorfunc=CmdErr;
		var zf='&zu='+(new Date()).getTime();
		var lo=htmlloader(url+zf,refunc,errorfunc);
	}
	var CmdRe=function(data){
		if(data!="OK")
			console.log('CmdRe',data);
	}
	var CmdErr=function(e){
		console.log('CmdErr',e);
	}
	
	var convert=function(s){//hexstr t string
		var re="", h;
		while(s.length>0){
			h=parseInt(s.substr(0,2), 16);
			re+=String.fromCharCode(h);
			s=s.substr(2);
		}
		return re;
	}
	
	var sendMsg=function(msg){
		//console.log(parent);
		parent.postMessage(msg,"*");
	}
	
	
	
	
	var radiostatus=function(data){
		console.log("Status",parseJSON(data));
	}
	var radioiniplayerstatus=function(data){//setup Controls
		var dat=parseJSON(data);
		radioplayerstatus(data);
	}
	var radioplayerstatus=function(data){//show Info
		var dat=parseJSON(data);
		radiodata=dat;
		
		/*console.log("Album",convert(dat.Album),
					"Artist",convert(dat.Artist),
					"Title",convert(dat.Title),
					"iuri",convert(dat.iuri));
		*/
		
		/*
			switch(radiodata.mode){
				case 0:		m="NONE";break;
				case 20:	m="HTTP";break;
				case 40:	m="LINEIN";break;
				case 41:	m="BT";break;
				
				mode: "43"=off
			}
		}*/
		
		
		sendMsg('updatadata');
		
		console.log("playerStatus",dat);
		
	}
	
	var gettimestr=function(sekunden){//12296000ms ->3h:24min.46sek
		var h=parseInt(sekunden/1000/60/60),
			min=parseInt((sekunden-h*1000*60*60)/1000/60),
			sek=parseInt((sekunden-h*1000*60*60-min*1000*60)/1000);
		if(h<9)h='0'+h;
		if(min<9)min='0'+min;
		if(sek<9)sek='0'+sek;
		
		return h+':'+min+':'+sek;
	}
	
	var playoffset=function(node){
		var deftitel=document.title;
		
		var msg=function(e){
			var p,l,pos=0,s;
			if(e.data=='updatadata'){
				p=radiodata.curpos;
				l=radiodata.totlen;
				
				if(l>0){
					pos=100/l*p;
					addClass(node.parentNode,"hatlength");
				}
				else{
					subClass(node.parentNode,"hatlength");
				}
				
				node.style.width=pos+"%";
				if(l>0){
					node.innerHTML=''+gettimestr(p)+' ('+gettimestr(l)+')';
					document.title=deftitel+' '+gettimestr(p)+' ('+gettimestr(l)+') '+parseInt(pos*100)/100+'%';	
				}
				else{
					node.innerHTML='';
					s=deftitel;
					if(radiodata.mode==20)s+=" HTTP";
					if(radiodata.mode==40)s+=" DAB";
					if(radiodata.mode==41)s+=" BT";
					if(radiodata.mode==43)s+=" off";
					
					document.title=s;
					
				}
			}
		}
		
		window.addEventListener("message", msg, false);
	}
	
	var playseeker=function(node){
		var audioinfo=0;
		var click=function(e){
			var b=this.offsetWidth,p=0;
			if(e.clientX){
				p=100/b*e.layerX;
			}
			if(e.layerX){
				p=100/b*e.layerX;
			}
			var spos=parseInt(radiodata.totlen*(p/100) /1000);
			new sendPlayerCmd('command=setPlayerCmd:seek:'+spos);
		}		
		node.addEventListener('click',click);
	}
	
	var VolumeNode=function(node){
		var change=function(e){
			new sendPlayerCmd('command=setPlayerCmd:vol:'+this.value);
		}
		
		var msg=function(e){
			if(e.data=="updatadata"){
				node.value=radiodata.vol;
				node.setAttribute('value',radiodata.vol);
			}
		}
		
		node.value=radiodata.vol;
		node.setAttribute('value',radiodata.vol);
		node.addEventListener('change',change);
		
		window.addEventListener("message", msg, false);
	}
	
	var VolumeShowNode=function(node){
		var msg=function(e){
			if(e.data=="updatadata"){
				node.innerHTML=radiodata.vol;
			}
		}
		window.addEventListener("message", msg, false);
	}
	
	var switchmodeButt=function(node){
		var attr=node.getAttribute("data-mradio");
		var mode=-1;
		if(attr.indexOf("switchmode:line-in")>-1)mode=40;
		if(attr.indexOf("playlist")>-1)mode=20;
		var playuri=attr;
		
		var clickbutt=function(e){
			addClass(node,"aktiv");
			if(attr.indexOf("#")>-1){
				var before=attr.split('#')[0];
				var id=attr.split('#')[1].split(':')[0];
				var after=':'+attr.split('#')[1].split(':')[1];
				var node=gE(id);
				if(node){
					var fileurl=encodeURI(node.value);//keine Leerzeichen!
					console.log(fileurl);
					if(fileurl.indexOf('%20')>-1)alert("Leerzeichen werden vom Radio nicht unterstützt :-/")
					var command='command=setPlayerCmd:'+before+fileurl+after;
					playuri=before+node.value+after;
					new sendPlayerCmd(command);
				}
			}
			else
				new sendPlayerCmd('command=setPlayerCmd:'+attr);
		}
		var msg=function(e){
			var aktiv=false;
			if(e.data=="updatadata"){
				if(mode==radiodata.mode){
					aktiv=true;
					if(mode==20){//HTTP
						aktiv=false;
						if(playuri.indexOf(convert(radiodata.iuri))>-1)aktiv=true;
					}
				}
				if(aktiv)
					addClass(node,"aktiv");
					else
					subClass(node,"aktiv");
			}
		}
		
		node.addEventListener('click',clickbutt);
		window.addEventListener("message", msg, false);
	}
	
	var mutebutt=function(node){
		var changeMute=function(e){
			if(this.checked){
				new sendPlayerCmd('command=setPlayerCmd:mute:1');
			}else{
				new sendPlayerCmd('command=setPlayerCmd:mute:0');
			}
		}
		
		var msg=function(e){
			if(e.data.indexOf('updatadata')>-1){
				node.checked=(radiodata.mute==1);
			}
		}
		
		node.addEventListener('change',changeMute);
		window.addEventListener("message", msg, false);
	}
	
	var butt=function(node,attr){
		var clickbutt=function(e){
			new sendPlayerCmd('command=setPlayerCmd:'+attr);
		}
		var msg=function(e){
			if(e.data.indexOf('updatadata')>-1){
				if(radiodata.status==attr)
					addClass(node,"aktiv");
				else
					subClass(node,"aktiv");
			}
		}
		node.addEventListener('click',clickbutt);
		addClass(node,"normalbutt");
		window.addEventListener("message", msg, false);
	}
	
	var setupMradioNode=function(node){
		var attr=node.getAttribute("data-mradio");
		
		switch(attr){
			case "vol":
				new VolumeNode(node);
			break;
			case "show:vol":
				new VolumeShowNode(node);
			break;
			case "mute":
				new mutebutt(node);
			break;
			case "pause":
				new butt(node,attr);
			break;
			case "stop":
				new butt(node,attr);
			break;
			case "resume":
				new butt(node,attr);
			break;
			case "playoffset":
				new playoffset(node);
			break;
			case "seeker":
				new playseeker(node);
			break;
		}
		
		if(attr.indexOf("switchmode")>-1){
			new switchmodeButt(node);
		}
		if(attr.indexOf("playlist")>-1){
			new switchmodeButt(node);
		}
		
	}
	
	var setupFunc=function(node){
		var i,n,liste=node.childNodes;
		for(i=0;i<liste.length;i++){
			n=liste[i];
			if(n.nodeName.indexOf('#')<0){
				if(n.getAttribute("data-mradio")!=undefined){
					setupMradioNode(n);
				}
			}
			if(n.childNodes.length>0)setupFunc(n);
		}
	}
	
	var udl=undefined;
	var updateloop=function(){
		if(udl!=undefined)clearTimeout(udl);
		udl=setTimeout(function(){
					sendPlayerCmd('command=getPlayerStatus',radioplayerstatus);
					updateloop();
				}
				,2000
				);
	}
	
	var ini=function(){
		var nodes=document.getElementsByTagName('body')[0];
		setupFunc(nodes);
		
		sendPlayerCmd('command=getStatus',radiostatus);		
		sendPlayerCmd('command=getPlayerStatus',radioiniplayerstatus);
		updateloop();
	}
	
	
	window.addEventListener('load', function (event){ini();});
}

mradio('mradio');