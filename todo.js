var http = require('http'),
	url = require('url'),
	fs = require('fs'),
	crypto = require('crypto'),
	profiles = {},
	actions = {},
	quickactions = {},
	needssave=true,
	scriptures = [{'BOM':531,'BIBLE':1590,'DC':298,'PEARL':61},2480];

function knuth_shuffle(a) {
    var n = a.length,
        r,
        temp;
    while (n > 1) {
        r = Math.floor(n * Math.random());
        n -= 1;
        temp = a[n];
        a[n] = a[r];
        a[r] = temp;
    }
    return a;
}

function profile(name) {
	this.name=name;
	this.tasks=[];
}
function displayprofile(profile) {
	var retr=[];
	var tasks=profile.tasks;
	retr.push('<a href="?p=');
	retr.push(profile.name);
	retr.push('&a=rand">');
	retr.push(profile.name);
	retr.push("</a><br /><ul>");
	for(var c in tasks) {
		retr.push('<li><span><a href="?p=');
		retr.push(profile.name);
		retr.push('&a=removefrom&t=');
		retr.push(tasks[c]);
		retr.push('">x</a>');
		retr.push(tasks[c]);
		retr.push('</span></li>');
	}
	//wrong.  Create plan to escape characters.
	retr.push('</ul><form method="GET" action="">\
		<input type="text" id="addition" name="t" /><input type="submit" />\
		<input type="text" name="a" class="hidden" value="addto" />\
		<input type="text" name="p" class="hidden" value="');
	retr.push(profile.name);
	retr.push('" /></form>');
 //onkeypress=function(e) { 
//		var x=JSON.parse(window.location.search.replace('?','{"').replace(/=/g,'":"').replace(/&/g,'","')+'"}');
	return retr.join('');
}

actions['add']=function(get,urlparse) {
	if(get['p']) {
		profiles[get['p']]=new profile(get['p']);
		return 'profile added';
	}
};
actions['addto']=function(get,urlparse) {
	if(get['t']  && get['p']) {
		profiles[get['p']].tasks.push(get['t']);
		return displayprofile(profiles[get['p']]);
	}
};
actions['rand']=function(get,urlparse) {
	if(get['p']) {
		var retr = [];
		var tasks=profiles[get.p].tasks;
		var numshown=Math.round(Math.max(0,Math.log(tasks.length)))+1;
		preselected = knuth_shuffle(profiles[get.p].tasks);
		retr.push('<a href="?p=');
		retr.push(get.p);
		retr.push('">');
		retr.push(get.p);
		retr.push('</a>&nbsp;&nbsp;&nbsp;<a href="');
		retr.push(urlparse.search);
		retr.push('">re-do</a>');
		retr.push('<br /><ul>');
		for(var c=0;c<numshown;++c) {
			retr.push('<li><span>');
			retr.push(preselected[c]);
			retr.push('</span></li>');
		}
		retr.push('</ul>');
		retr = retr.join('');
		console.log(retr);
		return retr;
	}
}
actions['removefrom']=function(get,urlparse) {
	if(get['p'] && get['t']) {
	//	if(profiles[get.p][get.t])
	//		delete profiles[get.p][get.id];
	//	else
//delete profiles[get.p][parseInt(get.id)];
		var profile=profiles[get['p']];
		var task=get['t'];
		var onlyonce=true;
		profile.tasks=profile.tasks.filter(function(el) {
			//Returns true if we keep it.
			if(!onlyonce)
				return true;
			onlyonce = task!==el;
			return onlyonce;
		});
		return displayprofile(profiles[get.p]);
	}
}
actions['save']=function(get,urlparse) {
	fs.writeFile('profiles',JSON.stringify(profiles));
	needssave=true;
}
actions['quickaction']=function(get,urlparse) {
	var f=quickactions[get['q']];
	return f?f():null;
}


function addlisttoprofile(profilename,list) {
	var t=profiles[profilename].tasks;
	for(var c=0;c<list.length;++c) {
		t.push(list[c]);
	}
}
		
var hiddenfunctions = { morning : function () {
  var listtoadd = ['eat','shower','chug water','pray'];
  listtoadd.push('scriptures:'+quickactions.rand_scripture());
  if( (new Date()).getDate()%3 == hiddenfunctions.phase ) {
   listtoadd.push('workout');
   if( Math.random()<Math.random() ) {
    --hiddenfunctions.phase;
    hiddenfunctions.phase%=3;
   }
  }
  addlisttoprofile('morning',listtoadd);
  return 'morning refreshed';
  },
 night : function () {
  var listtoadd = ['brush','insta-light works','water by bed','keys, wallet, phone together','pray','laptop docked','chug water','work commited to task list','journal'];
  listtoadd.push('scriptures:'+quickactions.rand_scripture());
  addlisttoprofile('night',listtoadd);
  return 'night refreshed';
 }
 phase : 0;
}

quickactions.refresh_refreshable = function () {
	profiles.morning=new profile('morning');
	profiles.night=new profile('night');
	hiddenfunctions.morning();
	hiddenfunctions.night();
}

quickactions.rand_scripture = function () {
	var i=Math.random()*scriptures[1];
	for(var x in scriptures[0]) {
		i-=scriptures[0][x];
		if(i<0)
			return x+': '+Math.floor(-i);
	}
}
quickactions.shutdown_gracefully = function () {
	actions.save();
	process.exit(0);
}

fs.readFile('profiles','utf-8',function (error,data) {
	if(!error) {
		try {
			profiles = JSON.parse(data);
		} catch (e) {}
	}
});

http.createServer(function(request,response) {
	request.on("end",function () {
		var urlparse = url.parse(request.url,true);
		var get = urlparse.query;
		response.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-cache','Connection':'keep-alive','Access-Control-Allow-Origin':'*'});
		response.write('<head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" /><link rel="stylesheet" type="text/css" href="http://vimque.com/taskstatic/base.css" /><link rel="stylesheet" type="text/css" href="http://vimque.com/taskstatic/skeleton.css" /><link rel="stylesheet" type="text/css" href="http://vimque.com/taskstatic/layout.css" /><link rel="stylesheet" type="text/css" href="http://vimque.com/taskstatic/todo.css" /><script src="http://vimque.com/taskstatic/script.js" type="text/javascript"></script></head><body><a href="/">Home</a><br /><br /><div id="data" style="float:left;">');
		try {
			var action = actions[get['a']];
			if(action) {
				var returned = action(get,urlparse);
				if(returned)
					response.write(returned);
			}
			else if(get['p']) {
				//Output listing a profile's contents
				response.write(displayprofile(profiles[get['p']]));
			}
			else {
				response.write('<ul class="horizontal_list"><li><ul>');
				for (x in profiles) {
					response.write('<li><span><a href="?p=');
					response.write(x);
					response.write('">');
					response.write(x);
					response.write('</a></span></li>');
				}
				response.write('</ul></li><li id="quickactions"><ul>');
				for (x in quickactions) {
					if (quickactions.hasOwnProperty(x)) {
						response.write('<li><span><a href="?a=quickaction&q=');
						response.write(x);
						response.write('">');
						response.write(x);
						response.write('</a></span></li>');
					}
				}
				response.write('</ul></li></ul>');
			}
		} 
		catch(e) {
			response.write('There was a server problem<br />');
			response.write(e.toString());
		}
		response.end('</div></body>');
		if(needssave) {
			needssave=false;
			setTimeout(actions['save'],30*60*1000);
		}
	});
}).listen(8080);
