
var canvas = document.getElementById('game');
	// get canvas context
var ctx = canvas.getContext('2d');
// load image

var sprache=0;

var cw=canvas.width;
var ch=canvas.height;

var music=null;

function reOffset(){
  var BB=canvas.getBoundingClientRect();
  offsetX=BB.left;
  offsetY=BB.top;        

	cw=canvas.width;
	ch=canvas.height;
}
var offsetX,offsetY;
reOffset();
window["onscroll"]=function(e){ reOffset(); }
window["onresize"]=function(e){ reOffset(); }

var score=0;
var highscore=0;

var images=[];

var gw=4;
var gh=4;

var phase;
var anim_frames=5;
var anim_length=30;

var anim_phase;//goes to 10 say
var anim;
var spawn;

var verloren=false;
var siegreich=false;

var last=1;
var laster=-1;


var raster_b=10;
var raster_h=22;
var verborgene_zeilen=4;

var zustände=[];
var anims=[];

function holZufälligeIntInklusi(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min +1)) + min; 
}

var tetrominos = [
	//tetris
	[
		[
			[ 1, 1, 1, 1, ],
		],
		[
			[ 0, 0, 1, 0 ], 
			[ 0, 0, 1, 0 ], 
			[ 0, 0, 1, 0 ],
			[ 0, 0, 1, 0 ], 			
		],
		[
			[ 1, 1, 1, 1, ],
		],
		[
			[ 0, 1, 0, 0 ], 
			[ 0, 1, 0, 0 ], 
			[ 0, 1, 0, 0 ],
			[ 0, 1, 0, 0 ], 			
		],
	],
	// J-piece
	[
		[
			[ 1, 0, 0, ],
			[ 1, 1, 1, ],
		],
		[
			[ 0, 1, 1, ],
			[ 0, 1, 0, ],
			[ 0, 1, 0, ],
		],
		[
			[ 0, 0, 0, ],
			[ 1, 1, 1, ],
			[ 0, 0, 1, ],
		],
		[
			[ 0, 1, 0 ],
			[ 0, 1, 0 ],
			[ 1, 1, 0 ],
		],
	],
	// L-piece
	[
		[
			[ 0, 0, 1, ],
			[ 1, 1, 1, ],
		],
		[
			[ 0, 1, 0, ],
			[ 0, 1, 0, ],
			[ 0, 1, 1, ],
		],
		[
			[ 1, 1, 1, ],
			[ 1, 0, 0, ],
		],
		[
			[ 1, 1, 0, ],
			[ 0, 1, 0, ],
			[ 0, 1, 0, ],
		],
	],
	// O-piece
	[
		[
			[ 1, 1, ],
			[ 1, 1, ],
		],
	],
	// S-piece
	[
		[
			[ 0, 1, 1, ],
			[ 1, 1, 0, ],
		],
		[
			[ 0, 1, 0, ],
			[ 0, 1, 1, ],
			[ 0, 0, 1, ],
		],
		[
			[ 0, 0, 0, ],
			[ 0, 1, 1, ],
			[ 1, 1, 0, ],
		],
		[
			[ 1, 0,0,  ],
			[ 1, 1,0,  ],
			[ 0, 1,0,  ],
		],
	],
	// T-Piece
	[
		[
			[ 0, 1, 0, ],
			[ 1, 1, 1, ],
		],

		
		[
			[ 0,1, 0, ],
			[ 0,1, 1, ],
			[ 0,1, 0, ],
		],

		[
			[ 1, 1, 1, ],
			[ 0, 1, 0, ],
		],
		
		[
			[ 0, 1,0, ],
			[ 1, 1,0, ],
			[ 0, 1,0, ],
		],

	],
	// Z-stück
	[
		[
			[ 1, 1, 0, ],
			[ 0, 1, 1, ],
		],
		[
			[ 0,0, 1, ],
			[ 0,1, 1, ],
			[ 0,1, 0, ],
		],
		[
			[ 0, 0, 0, ],
			[ 1, 1, 0, ],
			[ 0, 1, 1, ],
		],
		[
			[ 0, 1, 0, ],
			[ 1, 1, 0, ],
			[ 1, 0, 0, ],
		],
	],
]

var lookupdat=[
	[4,0],//0000
	[1,0],//0001
	[3,0],//0010
	[2,0],//0011
	[0,0],//0100
	[3,1],//0101*
	[4,1],//0110*
	[6,0],//0111
	[0,2],//1000
	[3,2],//1001*
	[4,2],//1010*
	[5,1],//1011
	[0,1],//1100
	[5,0],//1101
	[6,1],//1110
	[5,2],//1111

]


var lookupdat_würfel=[
	[4,0],//0000
	[1,0],//0001
	[3,0],//0010
	[2,0],//0011
	[0,0],//0100
	[1,1],//0101*
	[2,1],//0110*
	[6,0],//0111
	[0,2],//1000
	[1,2],//1001*
	[2,2],//1010*
	[5,1],//1011
	[0,1],//1100
	[5,0],//1101
	[6,1],//1110
	[5,2],//1111

]

function binstr(d){
	var ts=d.toString(2);
	while(ts.length<4){
		ts="0"+ts;
	}
	return ts;//.split("").reverse().join("");
}
function lookup(figuretyp,datum){
	datum=(datum>>1)%16;
	var ts=binstr(datum);
	var tx=-1;
	var ty=-1;
	var lud=lookupdat[datum]

	if (figuretyp===3){
		lud=lookupdat_würfel[datum];
	}
	tx=lud[0];
	ty=lud[1];
	return [tx,ty];
}

function Verbindungen_Ausrechnen(raster,farbe){
	var breite=raster[0].length;
	var höhe=raster.length;
	for (var i=0;i<breite;i++){
		for (var j=0;j<höhe;j++){
			var v_oben=0;
			var v_unten=0;
			var v_links=0;
			var v_rechts=0;

			if (raster[j][i]===0){
				continue;
			}
			if (i>0&&raster[j][i-1]>0){
				v_links=1;
			}
			if (i+1<breite&&raster[j][i+1]>0){
				v_rechts=1;
			}


			if (j>0&&raster[j-1][i]>0){
				v_oben=1;
			}
			if (j+1<höhe&&raster[j+1][i]>0){
				v_unten=1;
			}

			raster[j][i]=1+2*v_rechts+4*v_links+8*v_unten+16*v_oben+32*farbe;
		}
	}
}

var verbindungen_ausgerechnet=false;


var zukünftiges=-1;
var zukünftiges_drehung=-1;

var nächst=-1;
var nächst_drehung=-1;
var tasche=[0,1,2,3,4,5,6];

async function prüfZeilen(){
	var dscore=0;
	var zeilen=[];
	for (var j=0;j<raster_h;j++){
		var voll=true;
		for (var i=0;i<raster_b;i++){
			if (zustand[j][i]===0){
				voll=false;
				continue;
			}
		}
		if (voll){		
			dscore++;
			for (var i=0;i<raster_b;i++){
				zustand[j][i]=0;
				//2*v_rechts+4*v_links+8*v_unten+16*v_oben
				if (j>0){
					if ( (zustand[j-1][i]&8) === 8 ){
						zustand[j-1][i]-=8;
					}
				} 
				if (j<raster_h-1){
					if ( (zustand[j+1][i]&16) === 16 ){
						zustand[j+1][i]-=16;
					}					
				}
			}
			zeilen.push(j);
		}
	}

	if (dscore>=4){
		siegreich=true;
	}

	// dscore=dscore*dscore;	
	if (dscore>0){
		redraw();		
		//kleine pause

		if (!stumm){
			playSound(6532707);
		}
		await sleep(50);
		//fallen lassen

		for (var j_index=0;j_index<zeilen.length;j_index++){
			var j_leer = zeilen[j_index];
			for (var j=j_leer;j>0;j--){
				for (var i=0;i<raster_b;i++){
					zustand[j][i]=zustand[j-1][i];
					zustand[j-1][i]=0;
				}
			}

			await sleep(50);
			redraw();
		}
		redraw();
	}

	score=dscore;
	if (score>highscore){
		highscore=score;
		localStorage.setItem('my_max_combo',highscore);
	}
}
function wähleNeuesStück(){
	nächst=zukünftiges;
	nächst_drehung=zukünftiges_drehung;

	zukünftiges_index=holZufälligeIntInklusi(0,tasche.length-1);
	zukünftiges=tasche[zukünftiges_index];	
	tasche.splice(zukünftiges_index,1);
	// if (nächst===6){
	// 	zukünftiges=4;
	// } else {
	// 	zukünftiges=6;

	// }
	zukünftiges_drehung=holZufälligeIntInklusi(0,tetrominos[zukünftiges].length-1)
	
	if (tasche.length===0){
		tasche=[0,1,2,3,4,5,6];		
	}
}

function darfPlatzieren(stück,x,y){

	var nächst_z_h=stück.length;
	var nächst_z_b=stück[0].length;
	for (var i=0;i<nächst_z_b;i++){
		var globale_x=x+i;
		for (var j=0;j<nächst_z_h;j++){
			var globale_y=y+j;
			if (stück[j][i]===0){
				continue;
			}
			if (globale_x>=raster_b || globale_y>=raster_h || globale_x<0 || globale_y<0){
				return false;
			}

			if (stück[j][i]>0 && zustand[globale_y][globale_x]>0){
				return false;
			}
		}
	}
	return true;
}

var template_namen=[
"template_1",
"template_2",
"template_3",
"template_4",
"template_5",
"template_6",
"template_7"
];

var soff=0;

function projizieren(){	
	var stück=tetrominos[nächst][nächst_drehung];
	var nächst_z_h=stück.length;
	var nächst_z_b=stück[0].length;

	var ox=168;
	var oy=248-4*8;

	var sx=5-Math.ceil(nächst_z_b/2)+soff;
	var sy=0;

	var px=sx;
	var py=0;

	while (darfPlatzieren(stück,px,py+1)){
		py++;
	}

	if (moving===false){


		var min_x_i=100;
		var max_x_i=-100;
		for (var i=0;i<nächst_z_b;i++){
			var globale_z_x=ox+8*px+8*i;

			var has=false;
			for (var j=0;j<nächst_z_h;j++){
				var sd = (stück[j][i]>>1)%16
				console.log(sd)
				if ( sd!==0){
					has=true;
				}
			}
			var globale_z_y=oy;

			if (has){
				ctx.drawImage(images["mokcup/mokcup_fg_dynamic_overlay"], globale_z_x,oy,8,oy+8*18, globale_z_x,oy,8,oy+8*18)
			}
		}
		

		for (var i=0;i<nächst_z_b;i++){
			var globale_z_x=ox+8*px+8*i;
			for (var j=0;j<nächst_z_h;j++){
				if (py+j<2){

				}
				if (stück[j][i]>0){
					var globale_z_y=oy+8*py+8*j;
					if (globale_z_y<29){
						continue;
					}
					var lu = lookup(nächst,stück[j][i]);
					var tx=lu[0]*8;
					var ty=lu[1]*8;	
					ctx.drawImage(images["template_umriss"],tx,ty,8,8,globale_z_x,globale_z_y,8,8);
				}
			}
		}

	}
	return py;

}

async function resetGame(){
soff=0;
	moving=true;

	verloren=false;
	siegreich=false;
	tasche=[0,1,2,3,4,5,6];

	wähleNeuesStück();
	wähleNeuesStück();

	
	playSound(4159307);

	zustand=[];
	for (var j=0;j<raster_h;j++){
		var zeile=[];
		var zeile_anim=[];
		for (var i=0;i<raster_b;i++){
			zeile.push(0);
			zeile_anim.push(0);
		}
		zustand.push(zeile);
		anims.push(zeile_anim);
	}
	if (verbindungen_ausgerechnet===false){
		for (var i=0;i<tetrominos.length;i++){
			var menge=tetrominos[i];
			for (var j=0;j<menge.length;j++){
				Verbindungen_Ausrechnen(menge[j],i);
			}
		}
		verbindungen_ausgerechnet=true;
	}

	anim=[//comesfrom
	[[0,0],[0,0],[0,0],[0,0],[0,0]],
	[[0,0],[0,0],[0,0],[0,0],[0,0]],
	[[0,0],[0,0],[0,0],[0,0],[0,0]],
	[[0,0],[0,0],[0,0],[0,0],[0,0]],
	[[0,0],[0,0],[0,0],[0,0],[0,0]]];
	state=[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
	spawn=[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
	anim_phase=0;
	phase=0;
	score=0;

	moving=false;
	return Promise.resolve(1);
}


function animtick(){

	anim_phase++;
	if (anim_phase>anim_frames){
		anim_phase=anim_frames;
	}


	if (anim_phase<anim_frames)	{
		setTimeout(animtick,anim_length);		
	} else {
		phase=0;
	}

	redraw();
}

var piece_frames={
	1:["weiss","weiss_1","weiss_1","weiss_1"],
	2:["schwarz","schwarz_1","schwarz_1","weiss_1"],
	};

var bg_name =["mokcup/mokcup_fg","mokcup/mokcup_fg"];

var goimg_name =["verloren_en","verloren_de"];
var siegimg_name =["siegreich_en","siegreich_de"];

var _dx=[ [1,0],[0,-1],[-1,0],[0,1] ]
var _dy=[ [0,1],[-1,0],[0,-1],[1,0] ]
var _o = [ 
			[168,248],
			[248,247],
			[247,167],
			[167,168] 
		]
var _scorebox=[97,38]
var _linesbox=[97,86]
var _nachstbox=[97,113]

var scorebox=[14,372]
var highscorebox=[61,389]
var PI = 3.141592653589793238462643383279;

function redraw(){

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.drawImage(images[bg_name[sprache]], 0, 0);	

	for (var brunnen_index=0;brunnen_index<4;brunnen_index++){
		ctx.save();
		ctx.translate(208,208)
		ctx.rotate(-brunnen_index*PI/2)
		ctx.translate(-208,-208)
		//nächst
		var nox=264;
		var noy=360;
		var nächst_stück=tetrominos[nächst][nächst_drehung];
		var nächst_z_h=nächst_stück.length;
		var nächst_z_b=nächst_stück[0].length;
		var nächst_h=nächst_z_h*8;
		var nächst_b=nächst_z_b*8;
		
		var zukünftiges_stück=tetrominos[zukünftiges][zukünftiges_drehung];
		var zukünftiges_z_h=zukünftiges_stück.length;
		var zukünftiges_z_b=zukünftiges_stück[0].length;
		var zukünftiges_h=zukünftiges_z_h*8;
		var zukünftiges_b=zukünftiges_z_b*8;
		
		
		nox+=(4*8-zukünftiges_b)/2;
		noy+=(4*8-zukünftiges_h)/2;
		for (var i=0;i<zukünftiges_z_b;i++){
			for (var j=0;j<zukünftiges_z_h;j++){
				var z=zukünftiges_stück[j][i];
				if (z!==0){
					var x=nox+8*i;
					var y=noy+8*j;
					
					var lu = lookup(zukünftiges,zukünftiges_stück[j][i]);
					var tx=8*lu[0];
					var ty=8*lu[1];
					ctx.drawImage(images[template_namen[zukünftiges]],tx,ty,8,8,x,y,8,8);
				}
			}
		}

		projizieren();

		for (var i=0;i<raster_b;i++){
			for (var j=verborgene_zeilen;j<raster_h;j++){
				var z=zustand[j][i];
				if (z!==0){
					var sbx=168;
					var sby=248;

					var x=sbx+8*i;
					var y=sby+8*(j-verborgene_zeilen);
					
					var datum=zustand[j][i];
					var stücktyp=datum>>5;
					console.log(stücktyp);
					var lu = lookup(stücktyp,datum);
					var tx=8*lu[0];
					var ty=8*lu[1];

					ctx.drawImage(images[template_namen[stücktyp]],tx,ty,8,8,x,y,8,8);
				}
			}
		}



		ctx.restore();
	}

	if (verloren){
		ctx.drawImage(images[goimg_name[sprache]],15,29);
	} else if (siegreich){		
		ctx.drawImage(images[siegimg_name[sprache]],15,29);
	}


	for(var i=0;i<3;i++){
		var z_b=10;
		var z_h=14;
		var z_x=125;
		var z_y=161;
		var ziffer= Math.floor(highscore/(Math.pow(10,i)))%10;
		ctx.drawImage(images["ziffer_nokia"],10*ziffer,0,z_b,z_h,z_x+4*i,z_y,z_b,z_h);
	}


	if (stumm){
		ctx.drawImage(images["btn_mute"],424,8);
	}
	for(i=0;i<pressed.length;i++){
		if (pressed[i]){
			var dat = image_x_y[i];
			ctx.drawImage(images[dat[sprache]],dat[2],dat[3]);
		}
	}
}

var image_names=[
	"mokcup/mokcup_fg",
	"mokcup/mokcup_fg_dynamic_overlay",

	"pressed_rot2",
	"pressed_rot1",
	"pressed_drop",
	"pressed_right",
	"pressed_left",
	"pressed_up",
	"pressed_down",
	"pressed_new",
	"btn_mute",
	"btn_mute_pressed",
	"btn_unmuted_pressed",
	"btn_unmuted",

	"verloren_en",
	"verloren_de",
	"siegreich_en",
	"siegreich_de",
	"template_1",
	"template_2",
	"template_3",
	"template_4",
	"template_5",
	"template_6",
	"template_7",
	"template_umriss",
	"ziffer_nokia",
	"ziffer_nokia_gr",
	"btn_oben_de",
	"btn_unten_de",
	"btn_links_de",
	"btn_rechts_de",
	"btn_oben_en",
	"btn_unten_en",
	"btn_links_en",
	"btn_rechts_en",
	"btn_neustart_de",
	"btn_neustart_en",
	"btn_sprache_de",
	"btn_sprache_en",
	"btn_stumm_gedrückt",
	"btn_stumm_aus",
	"btn_stumm_aus_gedrückt",
	];

var stumm=false;

var image_x_y=[

["pressed_up","pressed_up",472,269,40,40],
["pressed_down","pressed_down",472,365,40,40],
["pressed_left","pressed_left",424,317,40,40],
["pressed_right","pressed_right",520,317,40,40],
["pressed_rot1","pressed_rot1",424,365,40,40],
["pressed_rot2","pressed_rot2",520,365,40,40],
["pressed_drop","pressed_drop",472,317,40,40],
["pressed_mute","pressed_mute",424,8,40,40],//7
["pressed_new","pressed_new",520,8,40,40],

];

for (var i=0;i<image_names.length;i++){
	var image = new Image();
	image.onload = function () {
	    // draw the image into the canvas
	    redraw();
	}
	image.src = image_names[i]+".png";
	images[image_names[i]]=image;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function full(){
	for (var i=0;i<gw;i++){
		for (var j=0;j<gh;j++){
			if (state[i][j]===0){
				return true;
			}
		}
	}
	return false;
}

var moving=false;

function ErzeugenMöglich(){
	for (var j=0;j<verborgene_zeilen;j++){
		for (var i=0;i<raster_b;i++){
			if (zustand[j][i]!==0){
				return false;
			}
		}
	}
	var stück=tetrominos[nächst][nächst_drehung];
	var nächst_z_h=stück.length;
	var nächst_z_b=stück[0].length;

	var ox=15;
	var oy=29-4*8;

	var sx=5-Math.ceil(nächst_z_b/2);
	var sy=0;

	for (var i=0;i<nächst_z_b;i++){
		var globale_z_x=sx+i;
		for (var j=0;j<nächst_z_h;j++){
			var globale_z_y=sy+j;
			if (zustand[globale_z_y][globale_z_x]>0){
				return false;
			}
		}
	}
	return true;
}

async function doMove(dx,dy){
	//stück erzeugen
	if (verloren||siegreich){
		return Promise.resolve(1);
	}


	if (dy===1){
		if (ErzeugenMöglich()===false){
			verloren=true;
			redraw();
			return Promise.resolve(1);
		}

		var stück=tetrominos[nächst][nächst_drehung];
		var nächst_z_h=stück.length;
		var nächst_z_b=stück[0].length;

		var ox=15;
		var oy=29-4*8;

		var sx=5-Math.ceil(nächst_z_b/2)+soff;
		var sy=projizieren()-1;
		soff=0;
		for (var i=0;i<nächst_z_b;i++){
			var globale_z_x=sx+i;
			for (var j=0;j<nächst_z_h;j++){
				var globale_z_y=sy+j;
				console.log((stück[j][i]>>1)%16)
				if (((stück[j][i]>>1)%16)!==0){
					zustand[globale_z_y][globale_z_x]=stück[j][i];
				}
			}
		}

		wähleNeuesStück();

		if(!stumm){
			playSound(4159307);
		}
	} else {
		if(!stumm){
			playSound(44213107);
		}
	}




	var bewegt=true;
	while (bewegt){
		bewegt=false;

		var neuezustand=[];
		for (var j=0;j<raster_h;j++){
			var zeile=[];
			for (var i=0;i<raster_b;i++){
				zeile.push(0);
			}
			neuezustand.push(zeile);
		}

		for (var i=0;i<raster_b;i++){
			for (var j=0;j<raster_h;j++){
				if (zustand[j][i]===0){
					anims[j][i]=0;
				} else {
					anims[j][i]=1;
				}
			}
		}


		var verarbeiten=true;
		while (verarbeiten){
			verarbeiten=false;

			//bewegungen versperren

			for (var i=0;i<raster_b;i++){
				for (var j=0;j<raster_h;j++){
					//wenn animation versperrt, mach propagation
					if (zustand[j][i]>0 && anims[j][i]>0){
						//prüf in der richtung der Bewegung
						var tx=i+dx;
						var ty=j+dy;
						if (tx<0||ty<0||tx>=raster_b||ty>=raster_h){
							anims[j][i]=0;
							verarbeiten=true;
						} else if (zustand[ty][tx]>0 && anims[ty][tx]===0){
							anims[j][i]=0;
							verarbeiten=true;							
						} else {
							//prüf verbundnen Ziegel
							var datum = zustand[j][i];
							//2*v_rechts+4*v_links+8*v_unten+16*v_oben
							var v_oben=(datum>>4)&1;
							var v_unten=(datum>>3)&1;
							var v_links=(datum>>2)&1;
							var v_rechts=(datum>>1)&1;
							if (v_oben===1){
								if (anims[j-1][i]==0){
									anims[j][i]=0;
									verarbeiten=true;													
								}
							}
							if (v_unten===1){
								if (anims[j+1][i]==0){
									anims[j][i]=0;
									verarbeiten=true;													
								}
							}
							if (v_links===1){
								if (anims[j][i-1]==0){
									anims[j][i]=0;
									verarbeiten=true;													
								}
							}
							if (v_rechts===1){
								if (anims[j][i+1]==0){
									anims[j][i]=0;
									verarbeiten=true;													
								}
							}
						}
					}
				}
			}
		}

		//mach bewegungen
		var was_ist_bewegt=false;
		for (var i=0;i<raster_b;i++){
			for (var j=0;j<raster_h;j++){
				var datum=zustand[j][i];
				if (datum!==0){
					if (anims[j][i]===0){
						neuezustand[j][i]=datum;
					} else {
						neuezustand[j+dy][i+dx]=datum;
						anims[j][i]=0;
						was_ist_bewegt=true;
					}
				}
			}
		}
		zustand=neuezustand;

		if (was_ist_bewegt){
			bewegt=true;
		}	

		if (bewegt){
			await sleep(30);
			redraw();
			// if (dx!==0){
			// 	return Promise.resolve(1);				
			// }
		} else {

			if(!stumm){
				playSound(67641907);
			}
		}

	}

	await prüfZeilen();

	if (ErzeugenMöglich()===false){
		verloren=true;
		redraw();
	}
	return Promise.resolve(1);
}

function dsoff(ds){
	var newsoff=soff+ds;

	var stück=tetrominos[nächst][nächst_drehung];
	var nächst_z_h=stück.length;
	var nächst_z_b=stück[0].length;

	var ox=15;
	var oy=29-4*8;

	var sx=5-Math.ceil(nächst_z_b/2)+newsoff;
	var sy=0;

	var px=sx;
	var py=0;

	if (darfPlatzieren(stück,sx,sy)){
		soff=newsoff;
	}
}

function oob(){
	var stück=tetrominos[nächst][nächst_drehung];
	var nächst_z_h=stück.length;
	var nächst_z_b=stück[0].length;

	var ox=15;
	var oy=29-4*8;

	var sx=5-Math.ceil(nächst_z_b/2)+soff;
	var sy=0;

	var px=sx;
	var py=0;

	if (darfPlatzieren(stück,sx,sy)===false){
		if (soff<0){
			soff++;
			oob();
		}
		if (soff>0){
			soff--;
			oob();
		}
	}
}

async function doPress(i){

	if (moving===true){
		return;
	}

	moving=true;

	pressed[i]=true;
	
	if (i===0){
		// await doMove(0,-1);
		nächst_drehung=(nächst_drehung+1)%tetrominos[nächst].length;
		oob();
	} else if (i===1){
		await doMove(0,1);
	} else if (i===2){
		dsoff(-1);
		// await doMove(-1,0);
	} else if (i===3){	
		dsoff(1);
		// await doMove(1,0);
	} else if (i===8){
		await resetGame();
	} else if (i===5){
		sprache=1-sprache;
		// await resetGame();
	} else if (i===7){
		stumm=!stumm;
		if (stumm===true){
			image_x_y[7][0]="btn_mute_pressed";
			image_x_y[7][1]="btn_mute_pressed";
			music.pause();
		} else {
			image_x_y[7][0]="btn_unmuted_pressed";
			image_x_y[7][1]="btn_unmuted_pressed";
			music.play()
		}
	}

	moving=false;
	redraw();

}

function  getMousePos(evt) {
	var rect = canvas.getBoundingClientRect(), // abs. size of element
	scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
	scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

	var clientX=evt.clientX;
	var clientY=evt.clientY;

	if (scaleX<scaleY){
		scaleX=scaleY;
		clientX-=rect.width/2-(cw/scaleX)/2;
	} else {
		scaleY=scaleX;
		clientY-=rect.height/2-(ch/scaleY)/2;
	}
	var x = (clientX - rect.left) * scaleX;   // scale mouse coordinates after they have
	var y =(clientY - rect.top) * scaleY     // been adjusted to be relative to element

	return [x,y];
}

var target=-1;


function handleUntap(e){
	if (target>=0){
		pressed[target]=false;
		target=-1;
		redraw();
	}
}

function handleTap(e){

	trySetupAudio();

	var [mouseX,mouseY] =getMousePos(e);



	// var xoff=0;
	// var yoff=0;

	// var canvas_width_pixeled=Math.floor(canvas.width*canvas.width/rect.width);
	// var canvas_height_pixeled=Math.floor(canvas.width*canvas.height/rect.height);

	// xoff = Math.floor(canvas_width_pixeled/2-cw/2);
	// yoff = Math.floor(canvas_height_pixeled/2-ch/2);

	// mouseX+=xoff;
	// mouseY+=yoff;

	for (var i=0;i<image_x_y.length;i++){
		var dat = image_x_y[i];
		var x_min=dat[2];
		var y_min=dat[3];
		var x_max=dat[2]+dat[4];
		var y_max=dat[3]+dat[5];

		if (mouseX>=x_min&&mouseX<=x_max&&mouseY>=y_min&&mouseY<=y_max){

			if (target>=0){
				pressed[target]=0;
			}
			target=i;

			doPress(i);
		}
	}

}

function emptyCells(){
	var result=[];
	for(var i=0;i<gw;i++){
		for (var j=0;j<gh;j++){
			if (state[i][j]===0){
				result.push([i,j]);
			}
		}
	}
	return result;
}

function neighbors (x,y){
  var result=[];
  if (x>0){
    result.push([x-1,y]);
  }
  if (x<gw-1){
    result.push([x+1,y]);
  }
  if (y>0){
    result.push([x,y-1]);
  }
  if (y<gh-1){
    result.push([x,y+1]);
  }
  return result;
}

function versuchFloodFill(x,y,todelete){


	if (state[x][y]===0){
	  return false;
	}

  var farbe = state[x][y];
  
  var base_idx=x+gw*y;
  if (todelete.indexOf(base_idx)>=0){
    return false;
  }

  
  var visited=[base_idx];

  var modified=true;
  while(modified){
    modified=false;

    for (var i=0;i<gw;i++){
      for (var j=0;j<gh;j++){
        var idx = i+gw*j;
        if (visited.indexOf(idx)>=0){
          continue;
        }

        //check if you've visited neighbours
        var hasneighbour=false;
        var nbs = neighbors(i,j);
        for (var k=0;k<nbs.length;k++){
          var nb = nbs[k];
          var nbi=nb[0]+gw*nb[1];
          if (visited.indexOf(nbi)>=0){
            hasneighbour=true;
          }
        }
        if (hasneighbour===false){
          continue;
        }

        var zelle_farbe=state[i][j];
        if (zelle_farbe===0){
          //escaped -- return! :)
          return false;
        }
        if (zelle_farbe!==farbe){
          continue;
        }

        visited.push(idx);
        modified=true;
      }
    }
  }

  if (visited.length===16){
    visited=[];
  }
  for (var i=0;i<visited.length;i++){
    todelete.push(visited[i]);
  }
  return visited.length>0;
}


function trySetupAudio(){
	return;
	if (music===null){
		music = new Audio('t1c.mp3');
		music.loop=true;
		music.volume=0.5;
		if (stumm==false){
			music.play();
		}
	}
}
function handleKeyDown(e){
	trySetupAudio();


	k = e.key.toLowerCase();
	if (k==="arrowup"||e.key=="w"){
		doPress(0);
		e.preventDefault();
		return false;
	}
	if (k==="arrowdown"||k==="s"){
		doPress(1);
		e.preventDefault();
		return false;
	}
	if (e.key==="ArrowLeft"||k=="a"){
		doPress(2);
		e.preventDefault();
		return false;
	}
	if (e.key==="ArrowRight"||k=="d"){
		doPress(3);
		e.preventDefault();
		return false;
	}

	if (k==="q"||k==="z"){
		doPress(4);
		e.preventDefault();
		return false;
	}

	if (k==="x"||k==="e"){
		doPress(5);
		e.preventDefault();
		return false;
	}

	if (k===" "||k==="c"){
		doPress(6);
		e.preventDefault();
		return false;
	}

	if (k==="m"){
		doPress(7);
		e.preventDefault();
		return false;
	}


	if (k==="r"||k==="n"){
		doPress(8);
		e.preventDefault();
		return false;
	}

}

var pressed=[false,false,false,false,false,false,false];

function handleKeyUp(e){
	k = e.key.toLowerCase();
	window.console.log(k);
	if (k==="arrowup"||e.key=="w"){
		pressed[0]=false;
	}
	if (k==="arrowdown"||k==="s"){
		pressed[1]=false;
	}
	if (e.key==="ArrowLeft"||k=="a"){
		pressed[2]=false;
	}
	if (e.key==="ArrowRight"||k=="d"){
		pressed[3]=false;
	}

	if (k==="q"||k==="z"){
		pressed[4]=false;
	}

	if (k==="x"||k==="e"){
		pressed[5]=false;
	}

	if (k===" "||k==="c"){
		pressed[6]=false;
	}

	if (k==="m"){
		pressed[7]=false;
	}


	if (k==="r"||k==="n"){
		pressed[8]=false;
	}
	redraw();
	// console.log("keyup "+e.key)
}

canvas.addEventListener("pointerdown",handleTap);
canvas.addEventListener("pointerup",handleUntap);
document.addEventListener("keydown",handleKeyDown);
document.addEventListener("keyup",handleKeyUp);

highscore = parseInt(localStorage.getItem('my_max_combo'));
if (Number.isNaN(highscore)){
	highscore=0;
}
resetGame();