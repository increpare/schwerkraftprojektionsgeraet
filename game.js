
let canvas = document.getElementById('game');
	// get canvas context
let ctx = canvas.getContext('2d');
// load image

let sprache=0;

let cw=canvas.width;
let ch=canvas.height;

let music=null;

const MAX_BRUNNEN=4;

function reOffset(){
  let BB=canvas.getBoundingClientRect();
  offsetX=BB.left;
  offsetY=BB.top;        

	cw=canvas.width;
	ch=canvas.height;
}
let offsetX,offsetY;
reOffset();
window["onscroll"]=function(e){ reOffset(); }
window["onresize"]=function(e){ reOffset(); }


let score=0;
let linecount=[0,0,0,0];

let highscore=0;

let images=[];

let gw=4;
let gh=4;



let verloren=false;

let last=1;
let laster=-1;


let raster_b=10;
let raster_h=14;
let verborgene_zeilen=4;

let zustand=[];
let anims=[];


let alle_zustände=[];
let alle_anims=[];

function holZufälligeIntInklusi(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min +1)) + min; 
}

let tetrominos = [
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
		[
			[ 1, 1, ],
			[ 1, 1, ],
		],
		[
			[ 1, 1, ],
			[ 1, 1, ],
		],
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
			[ 0, 1, ],
			[ 1, 1, ],
			[ 1, 0, ],
		],
		[
			[ 1, 1, 0, ],
			[ 0, 1, 1, ],
		],
		[
			[ 0, 1,  ],
			[ 1, 1,  ],
			[ 1, 0,  ],
		],
	],
]


function leftmost(stück){
	let stück_h=stück.length;
	let stück_b=stück[0].length;

	for (var i=0;i<stück_b;i++){
		for (var j=0;j<stück_h;j++){
			if (stück[j][i]>0){
				return i;
			}
		}
	}

	console.log("Soll nich hier ankommen! Muss 'nen Fehler geben.")
	return -1;
}

let tetromino_onset=[]///record onset x values to allow for smart rotations in mirrored images

for (let i=0;i<tetrominos.length;i++){
	var rots=tetrominos[i];
	var ar=[];
	for (let j=0;j<rots.length;j++){
		ar.push(leftmost(rots[j]))
	}
	tetromino_onset.push(ar);
}

let lookupdat=[
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


let lookupdat_würfel=[
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
	let ts=d.toString(2);
	while(ts.length<4){
		ts="0"+ts;
	}
	return ts;//.split("").reverse().join("");
}
function lookup(figuretyp,datum){
	datum=(datum>>1)%16;
	let ts=binstr(datum);
	let tx=-1;
	let ty=-1;
	let lud=lookupdat[datum]

	if (figuretyp===3){
		lud=lookupdat_würfel[datum];
	}
	tx=lud[0];
	ty=lud[1];
	return [tx,ty];
}

function Verbindungen_Ausrechnen(raster,farbe){
	let breite=raster[0].length;
	let höhe=raster.length;
	for (let i=0;i<breite;i++){
		for (let j=0;j<höhe;j++){
			let v_oben=0;
			let v_unten=0;
			let v_links=0;
			let v_rechts=0;

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

let verbindungen_ausgerechnet=false;


let zukünftiges=-1;
let zukünftiges_drehung=-1;

let globale_nächst_drehung=0;
let nächst=-1;
let nächst_drehung=-1;
let tasche=[0,1,2,3,4,5,6];

let cursor_x=3;
let cursor_y=3;


async function prüfZeilen(){
	let dscore=0;
	let zeilen=[];
	for (let j=0;j<raster_h;j++){
		let voll=true;
		for (let i=0;i<raster_b;i++){
			if (zustand[j][i]===0){
				voll=false;
				continue;
			}
		}
		if (voll){		
			dscore++;
			for (let i=0;i<raster_b;i++){
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
	linecount[globaler_brunnen]+=dscore;
	score=Math.min(...linecount)
	
	// dscore=dscore*dscore;	
	if (dscore>0){
		redraw();		
		//kleine pause

		if (!stumm&&!poweroff){
			playSound(6532707);
		}
		await sleep(50);
		//fallen lassen

		console.log("fallen")
		for (let j_index=0;j_index<zeilen.length;j_index++){
			let j_leer = zeilen[j_index];
			for (let j=j_leer;j>0;j--){
				for (let i=0;i<raster_b;i++){
					zustand[j][i]=zustand[j-1][i];
					zustand[j-1][i]=0;
				}
			}

			await sleep(50);
			redraw();
		}
		redraw();
	}

	if (score>highscore){
		highscore=score;
		localStorage.setItem('musiii_my_max_combo',highscore);
	}

	return Promise.resolve(1);
}

function wähleNeuesStück(){
	nächst=zukünftiges;
	globale_nächst_drehung=zukünftiges_drehung;

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

	let nächst_z_h=stück.length;
	let nächst_z_b=stück[0].length;
	for (let i=0;i<nächst_z_b;i++){
		let globale_x=x+i;
		for (let j=0;j<nächst_z_h;j++){
			let globale_y=y+j;
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

let template_namen=[
"template_1",
"template_2",
"template_3",
"template_4",
"template_5",
"template_6",
"template_7"
];

let soff=0;

function projizieren(){	
	let stück=tetrominos[nächst][nächst_drehung];
	let nächst_z_h=stück.length;
	let nächst_z_b=stück[0].length;

	let ox=96;
	let oy=176-4*8;

	let sx=5-Math.ceil(nächst_z_b/2)+soff;
	let sy=0;

	let px=sx;
	let py=0;

	while (darfPlatzieren(stück,px,py+1)){
		py++;
	}

	if (moving===false){



		for (let i=0;i<nächst_z_b;i++){
			let globale_z_x=ox+8*px+8*i;
			for (let j=0;j<nächst_z_h;j++){
				if (py+j<2){

				}
				if (stück[j][i]>0){
					let globale_z_y=oy+8*py+8*j;
					if (globale_z_y<29){
						continue;
					}
					let lu = lookup(nächst,stück[j][i]);
					let tx=lu[0]*8;
					let ty=lu[1]*8;	
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
	cursor_x=3;
	cursor_y=3;
	verloren=false;
	tasche=[0,1,2,3,4,5,6];
	linecount=[0,0,0,0]
	score=0;
	wähleNeuesStück();
	wähleNeuesStück();

	if (!stumm&&!poweroff){
		playSound(4159307);
	}

	alle_zustände=[]
	alle_anims=[]
	for (let brunnen_index=0;brunnen_index<MAX_BRUNNEN;brunnen_index++){
		anims=[];
		zustand=[];
		for (let j=0;j<raster_h;j++){
			let zeile=[];
			let zeile_anim=[];
			for (let i=0;i<raster_b;i++){
				zeile.push(0);
				zeile_anim.push(0);
			}
			zustand.push(zeile);
			anims.push(zeile_anim);
		}
		alle_zustände.push(zustand)
		alle_anims.push(anims)
	}

	if (verbindungen_ausgerechnet===false){
		for (let i=0;i<tetrominos.length;i++){
			let menge=tetrominos[i];
			for (let j=0;j<menge.length;j++){
				Verbindungen_Ausrechnen(menge[j],i);
			}
		}
		verbindungen_ausgerechnet=true;
	}

	score=0;

	moving=false;
	return Promise.resolve(1);
}

let piece_frames={
	1:["weiss","weiss_1","weiss_1","weiss_1"],
	2:["schwarz","schwarz_1","schwarz_1","weiss_1"],
	};

let bg_name =["mokcup/mokcup_fg","mokcup/mokcup_fg"];

let goimg_name =["verloren_en","verloren_en"];

let _dx=[ [1,0],[0,-1],[-1,0],[0,1] ]
let _dy=[ [0,1],[-1,0],[0,-1],[1,0] ]
let _o = [ 
			[168,248],
			[248,247],
			[247,167],
			[167,168] 
		]

let PI = 3.141592653589793238462643383279;

let globaler_brunnen=-1;
function setGlobalerZustand(brunnen_index){
	globaler_brunnen=brunnen_index;
	zustand=alle_zustände[brunnen_index]
	anims=alle_anims[brunnen_index]
	nächst_drehung=(globale_nächst_drehung+brunnen_index)%4;

	nächst_stück=tetrominos[nächst][nächst_drehung];
	nächst_z_h=nächst_stück.length;
	nächst_z_b=nächst_stück[0].length;

	let dx = 5-Math.ceil(nächst_z_b/2);
	let dy = 5-Math.ceil(nächst_z_h/2);

	let [cursor_min_x,cursor_min_y,cursor_max_x,cursor_max_y]=calc_cursor_bounds();

	switch(brunnen_index){
		case 0:
			soff=cursor_min_x-tetromino_onset[nächst][nächst_drehung]-dx;
		break;
		case 1:
			soff=(9-cursor_max_y)-tetromino_onset[nächst][nächst_drehung]-dx;
		break;
		case 2:
			soff=(9-cursor_max_x)-tetromino_onset[nächst][nächst_drehung]-dx;
		break;
		case 3:
			soff=cursor_min_y-tetromino_onset[nächst][nächst_drehung]-dx;
		break;
	}

}

function redraw(){

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.drawImage(images[bg_name[sprache]], 0, 0);	




	if (stumm||poweroff){
		ctx.drawImage(images["vol_auf"],16,16);
	}

	if (poweroff){
		ctx.drawImage(images["power_auf"],16,224);
	}

	for(i=0;i<pressed.length;i++){
		if (pressed[i]){
			let dat = image_x_y[i];
			ctx.drawImage(images[dat[sprache]],dat[2],dat[3]);
		}
	}

	if (poweroff){
		return;
	}

	const zentrum_x=96;
	const zentrum_y=96;

	let zukünftiges_stück=tetrominos[zukünftiges][zukünftiges_drehung];
	let zukünftiges_z_h=zukünftiges_stück.length;
	let zukünftiges_z_b=zukünftiges_stück[0].length;
	let zukünftiges_h=zukünftiges_z_h*8;
	let zukünftiges_b=zukünftiges_z_b*8;
	
	let noxes=[184,223,54,15]
	let noys=[223,53,15,184]
	for (let q=0;q<4;q++){
		let nox=noxes[q];
		let noy=noys[q];
		
		nox+=(4*8-zukünftiges_b)/2;
		noy+=(4*8-zukünftiges_h)/2;

		{
			for (let i=0;i<zukünftiges_z_b;i++){
				for (let j=0;j<zukünftiges_z_h;j++){
					let z=zukünftiges_stück[j][i];
					if (z!==0){
						let x=nox+8*i;
						let y=noy+8*j;
						
						let lu = lookup(zukünftiges,zukünftiges_stück[j][i]);
						let tx=8*lu[0];
						let ty=8*lu[1];
						ctx.drawImage(images[template_namen[zukünftiges]],tx,ty,8,8,x,y,8,8);
					}
				}
			}
		}
	}


	let nächst_stück=tetrominos[nächst][globale_nächst_drehung];
	let nächst_z_h=nächst_stück.length;
	let nächst_z_b=nächst_stück[0].length;
	let nächst_h=nächst_z_h*8;
	let nächst_b=nächst_z_b*8;

	{
		let nox=zentrum_x+8*cursor_x;
		let noy=zentrum_y+8*cursor_y;

		var spalte_y=16;
		var spalte_höhe=240;

		//Spalten
		for (let i=0;i<nächst_z_b;i++){
			let globale_z_x=nox+8*i;

			let has=false;
			for (let j=0;j<nächst_z_h;j++){
				let sd = (nächst_stück[j][i]>>1)%16
				if ( sd!==0){
					has=true;
					break;
				}
			}
			if (has){
				ctx.drawImage(images["mokcup/mokcup_fg_dynamic_overlay"], globale_z_x,spalte_y,8,spalte_höhe, globale_z_x,spalte_y,8,spalte_höhe)
			}
		}
		

		var zeile_x=16;
		var zeile_breite=240;

		//Zeilen
		for (let j=0;j<nächst_z_h;j++){
			let globale_z_y=noy+8*j;

			let has=false;
			for (let i=0;i<nächst_z_b;i++){
				let sd = (nächst_stück[j][i]>>1)%16
				if ( sd!==0){
					has=true;
					break;
				}
			}
			if (has){
				ctx.drawImage(images["mokcup/mokcup_fg_dynamic_overlay"], zeile_x,globale_z_y,zeile_breite,8, zeile_x,globale_z_y,zeile_breite,8)
			}
		}
		


		
		{
			for (let i=0;i<nächst_z_b;i++){
				for (let j=0;j<nächst_z_h;j++){
					let z=nächst_stück[j][i];
					if (z!==0){
						let x=nox+8*i;
						let y=noy+8*j;
						
						let lu = lookup(nächst,nächst_stück[j][i]);
						let tx=8*lu[0];
						let ty=8*lu[1];
						ctx.drawImage(images[template_namen[nächst]],tx,ty,8,8,x,y,8,8);
					}
				}
			}
		}
	}
	

	for(let i=0;i<2;i++){
		let z_b=10;
		let z_h=14;
		let z_x=319;
		let z_y=74;
		let ziffer= Math.floor(score/(Math.pow(10,1-i)))%10;
		ctx.drawImage(images["ziffer_nokia_gr"],10*ziffer,0,z_b,z_h,z_x+13*i,z_y,z_b,z_h);
	}


	for(let i=0;i<2;i++){
		let z_b=10;
		let z_h=14;
		let z_x=319;
		let z_y=94;
		let ziffer= Math.floor(highscore/(Math.pow(10,1-i)))%10;
		ctx.drawImage(images["ziffer_nokia_gr"],10*ziffer,0,z_b,z_h,z_x+13*i,z_y,z_b,z_h);
	}

	var alte_brunnen_zustand=globaler_brunnen;

	for (let brunnen_index=0;brunnen_index<MAX_BRUNNEN;brunnen_index++){
		ctx.save();
		ctx.translate(136,136)
		ctx.rotate(-brunnen_index*PI/2)
		ctx.translate(-136,-136)
		//nächst
		
		setGlobalerZustand(brunnen_index)

		nächst_stück=tetrominos[nächst][nächst_drehung];
		nächst_z_h=nächst_stück.length;
		nächst_z_b=nächst_stück[0].length;



		projizieren();

		for (let i=0;i<raster_b;i++){
			for (let j=verborgene_zeilen;j<raster_h;j++){
				let z=zustand[j][i];
				if (z!==0){
					let sbx=96;
					let sby=176;

					let x=sbx+8*i;
					let y=sby+8*(j-verborgene_zeilen);
					
					let datum=zustand[j][i];
					let stücktyp=((datum%256)>>5);
					let lu = lookup(stücktyp,datum);
					let tx=8*lu[0];
					let ty=8*lu[1];

					ctx.drawImage(images[template_namen[stücktyp]],tx,ty,8,8,x,y,8,8);
				}
			}
		}



		for(let i=0;i<2;i++){
			let z_b=10;
			let z_h=14;
			let z_x=190;
			let z_y=200;
			let ziffer= Math.floor(linecount[brunnen_index]/(Math.pow(10,1-i)))%10;
			ctx.drawImage(images["ziffer_nokia_gr"],10*ziffer,0,z_b,z_h,z_x+13*i,z_y,z_b,z_h);
		}



		ctx.restore();
	}
	setGlobalerZustand(alte_brunnen_zustand)
	if (verloren){
		ctx.drawImage(images[goimg_name[sprache]],zentrum_x,zentrum_x);
	}

}

let image_names=[
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

	"vol_auf",
	"vol_auf_gedrueckt",
	"vol_an_gedrueckt",
	
	"power_auf",
	"power_an_gedrueckt",
	"power_auf_gedrueckt",

	"verloren_en",
	"template_1",
	"template_2",
	"template_3",
	"template_4",
	"template_5",
	"template_6",
	"template_7",
	"template_umriss",
	"ziffer_nokia_gr",
	];

let stumm=false;
let poweroff=true;

let image_x_y=[

["pressed_up","pressed_up",316,120,40,40],
["pressed_down","pressed_down",316,216,40,40],
["pressed_left","pressed_left",268,168,40,40],
["pressed_right","pressed_right",364,168,40,40],
["pressed_rot1","pressed_rot1",268,216,40,40],
["pressed_rot2","pressed_rot2",364,216,40,40],
["pressed_drop","pressed_drop",316,168,40,40],
["vol_auf_gedrueckt","vol_auf_gedrueckt",16,16,32,55],//7
["power_an_gedrueckt","power_an_gedrueckt",16,224,55,32],

];

for (let i=0;i<image_names.length;i++){
	let image = new Image();
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


let moving=false;

function ErzeugenMöglich(){
	for (let j=0;j<verborgene_zeilen;j++){
		for (let i=0;i<raster_b;i++){
			if (zustand[j][i]!==0){
				return false;
			}
		}
	}
	let stück=tetrominos[nächst][nächst_drehung];
	let nächst_z_h=stück.length;
	let nächst_z_b=stück[0].length;

	let ox=15;
	let oy=29-4*8;

	let sx=5-Math.ceil(nächst_z_b/2);
	let sy=0;

	for (let i=0;i<nächst_z_b;i++){
		let globale_z_x=sx+i;
		for (let j=0;j<nächst_z_h;j++){
			let globale_z_y=sy+j;
			if (zustand[globale_z_y][globale_z_x]>0){
				return false;
			}
		}
	}
	return true;
}

async function doMove(dx,dy){
	console.log("doMove")
	//stück erzeugen
	if (verloren){
		return Promise.resolve(1);
	}


	if (ErzeugenMöglich()===false){
		verloren=true;
		redraw();
		return Promise.resolve(1);
	}

	let stück=tetrominos[nächst][nächst_drehung];
	let nächst_z_h=stück.length;
	let nächst_z_b=stück[0].length;

	let ox=15;
	let oy=29-4*8;

	let sx=5-Math.ceil(nächst_z_b/2)+soff;
	let sy=0;//projizieren();
	soff=0;
	for (let i=0;i<nächst_z_b;i++){
		let globale_z_x=sx+i;
		for (let j=0;j<nächst_z_h;j++){
			let globale_z_y=sy+j;
			if (((stück[j][i]>>1)%16)!==0){
				zustand[globale_z_y][globale_z_x]=stück[j][i];
			}
		}
	}


	let bewegt=true;
	while (bewegt){
		bewegt=false;


		console.log("bewegungenloop")

		let neuezustand=[];
		for (let j=0;j<raster_h;j++){
			let zeile=[];
			for (let i=0;i<raster_b;i++){
				zeile.push(0);
			}
			neuezustand.push(zeile);
		}

		for (let i=0;i<raster_b;i++){
			for (let j=0;j<raster_h;j++){
				if (zustand[j][i]===0 || ( (zustand[j][i]&256)===256) ){
					anims[j][i]=0;
				} else {
					anims[j][i]=1;
				}
			}
		}


		let verarbeiten=true;
		while (verarbeiten){
			verarbeiten=false;
			console.log("verarbeitenloop")
			//bewegungen versperren

			for (let i=0;i<raster_b;i++){
				for (let j=0;j<raster_h;j++){
					//wenn animation versperrt, mach propagation
					if (zustand[j][i]>0 && anims[j][i]>0){
						//prüf in der richtung der Bewegung
						let tx=i+dx;
						let ty=j+dy;
						if (tx<0||ty<0||tx>=raster_b||ty>=raster_h){
							anims[j][i]=0;
							verarbeiten=true;
						} else if (zustand[ty][tx]>0 && anims[ty][tx]===0){
							anims[j][i]=0;
							verarbeiten=true;							
						} else {
							//prüf verbundnen Ziegel
							let datum = zustand[j][i];
							//2*v_rechts+4*v_links+8*v_unten+16*v_oben
							let v_oben=(datum>>4)&1;
							let v_unten=(datum>>3)&1;
							let v_links=(datum>>2)&1;
							let v_rechts=(datum>>1)&1;
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
		let was_ist_bewegt=false;
		for (let i=0;i<raster_b;i++){
			for (let j=0;j<raster_h;j++){
				let datum=zustand[j][i];
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
		console.log("was_ist_bewegt="+was_ist_bewegt)

		for (var j=0;j<neuezustand.length;j++){
			var r = neuezustand[j];
			for (var i=0;i<r.length;i++){
				zustand[j][i]=neuezustand[j][i];
			}
		}

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

			if(!stumm&&!poweroff){
				playSound(67641907);
			}
		}

	}

	for (let i=0;i<raster_b;i++){
		for (let j=0;j<raster_h;j++){
			if (zustand[j][i]!==0){
				zustand[j][i]=zustand[j][i]|256;
			}
		}
	}

	console.log("prüfZeilen")
	await prüfZeilen();

	if (ErzeugenMöglich()===false){
		console.log("ErzeugenMöglich ist falsch")
		verloren=true;
		redraw();
	}
	return Promise.resolve(1);
}

function cursor_dsoff(dx,dy){

	if (verloren){
		return Promise.resolve(1);
	}

	let neue_x=cursor_x+dx;
	let neue_y=cursor_y+dy;

	let stück=tetrominos[nächst][globale_nächst_drehung];
	let nächst_z_h=stück.length;
	let nächst_z_b=stück[0].length;

	let arena_breite=10;
	let arena_höhe=10;

	let allesgute=true;

	outerloop:
	for (let i=0;i<nächst_z_b;i++){
		let globale_x=neue_x+i;
		for (let j=0;j<nächst_z_h;j++){
			let globale_y=neue_y+j;
			if (stück[j][i]===0){
				continue;
			}
			if (globale_x>=10 || globale_y>=10 || globale_x<0 || globale_y<0){
				allesgute = false;
				break outerloop;
			}
		}
	}

	if (allesgute){
		cursor_x=neue_x;
		cursor_y=neue_y;
	}
}

function dsoff(ds){
	let newsoff=soff+ds;

	let stück=tetrominos[nächst][nächst_drehung];
	let nächst_z_h=stück.length;
	let nächst_z_b=stück[0].length;

	let ox=15;
	let oy=29-4*8;

	let sx=5-Math.ceil(nächst_z_b/2)+newsoff;
	let sy=0;

	let px=sx;
	let py=0;

	if (darfPlatzieren(stück,sx,sy)){
		soff=newsoff;
	}
}

function calc_cursor_bounds(){

	let stück=tetrominos[nächst][globale_nächst_drehung];
	let nächst_z_h=stück.length;
	let nächst_z_b=stück[0].length;

	let min_x=100;
	let max_x=-100;
	let min_y=100;
	let max_y=-100;

	for (let i=0;i<nächst_z_b;i++){
		let globale_x=cursor_x+i;
		for (let j=0;j<nächst_z_h;j++){
			let globale_y=cursor_y+j;
			if (stück[j][i]===0){
				continue;
			}
			if(globale_x<min_x){
				min_x=globale_x;
			}
			if(globale_y<min_y){
				min_y=globale_y;
			}
			if(globale_x>max_x){
				max_x=globale_x;
			}
			if(globale_y>max_y){
				max_y=globale_y;
			}
		}
	}

	return [min_x,min_y,max_x,max_y]
}

function zetrum_oob(){
	var [min_x,min_y,max_x,max_y]=calc_cursor_bounds();
	if(min_x<0){
		cursor_x-=min_x;
	}
	if(min_y<0){
		cursor_y-=min_y;
	}

	if(max_x>=10){
		cursor_x-=(max_x-9);
	}
	if(max_y>=10){
		cursor_y-=(max_y-9);
	}
}

function oob(){
	let stück=tetrominos[nächst][nächst_drehung];
	let nächst_z_h=stück.length;
	let nächst_z_b=stück[0].length;

	let ox=15;
	let oy=29-4*8;

	let sx=5-Math.ceil(nächst_z_b/2)+soff;
	let sy=0;

	let px=sx;
	let py=0;

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

async function spawn(){
	if(!stumm&&!poweroff){
		playSound(4159307);
	}

	for (let brunnen_index=0;brunnen_index<MAX_BRUNNEN;brunnen_index++){
		console.log("start"+globaler_brunnen)
		setGlobalerZustand(brunnen_index)

		await doMove(0,1,brunnen_index);
		console.log("end"+globaler_brunnen)
	}

	wähleNeuesStück();
	zetrum_oob();

	return Promise.resolve(1);
}

async function doPress(i){

	if (moving===true){
		return;
	}


	pressed[i]=true;
	

	moving=true;

	if (poweroff===false||i===8){
		switch(i){
			case 0:
				cursor_dsoff(0,-1);
			break;
			case 1:
				cursor_dsoff(0,1);
			break;
			case 2:
				cursor_dsoff(-1,0);
			break;
			case 3:
				cursor_dsoff(1,0);
			break;
			case 4:
				globale_nächst_drehung=(globale_nächst_drehung+1)%tetrominos[nächst].length;
				zetrum_oob();
			break;
			case 5:
				globale_nächst_drehung=(globale_nächst_drehung+3)%tetrominos[nächst].length;
				zetrum_oob();
			break;
			case 6://place
				await spawn();
			break;
			case 7://mute
			{
				stumm=!stumm;
				if (stumm===true){
					image_x_y[7][0]="vol_an_gedrueckt";
					image_x_y[7][1]="vol_an_gedrueckt";
					// if (music){
						// music.pause();
					// }
				} else {
					image_x_y[7][0]="vol_auf_gedrueckt";
					image_x_y[7][1]="vol_auf_gedrueckt";
					// if (music){
						// music.play()
					// }
				}
				break;
			}
			case 8://restart
				poweroff=!poweroff;
				if (poweroff===false){
					await resetGame();				
				}
			break;
		}
	}

	moving=false;
	redraw();

	return Promise.resolve(1);
}

function  getMousePos(evt) {
	let rect = canvas.getBoundingClientRect(), // abs. size of element
	scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
	scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

	let clientX=evt.clientX;
	let clientY=evt.clientY;

	if (scaleX<scaleY){
		scaleX=scaleY;
		clientX-=rect.width/2-(cw/scaleX)/2;
	} else {
		scaleY=scaleX;
		clientY-=rect.height/2-(ch/scaleY)/2;
	}
	let x = (clientX - rect.left) * scaleX;   // scale mouse coordinates after they have
	let y =(clientY - rect.top) * scaleY     // been adjusted to be relative to element

	return [x,y];
}

let target=-1;


function handleUntap(e){
	if (target>=0){
		pressed[target]=false;
		target=-1;
		redraw();
	}
}

function handleTap(e){

	trySetupAudio();

	let [mouseX,mouseY] =getMousePos(e);



	// let xoff=0;
	// let yoff=0;

	// let canvas_width_pixeled=Math.floor(canvas.width*canvas.width/rect.width);
	// let canvas_height_pixeled=Math.floor(canvas.width*canvas.height/rect.height);

	// xoff = Math.floor(canvas_width_pixeled/2-cw/2);
	// yoff = Math.floor(canvas_height_pixeled/2-ch/2);

	// mouseX+=xoff;
	// mouseY+=yoff;

	for (let i=0;i<image_x_y.length;i++){
		let dat = image_x_y[i];
		let x_min=dat[2];
		let y_min=dat[3];
		let x_max=dat[2]+dat[4];
		let y_max=dat[3]+dat[5];

		if (mouseX>=x_min&&mouseX<=x_max&&mouseY>=y_min&&mouseY<=y_max){

			if (target>=0){
				pressed[target]=0;
			}
			target=i;

			doPress(i);
		}
	}

}
function neighbors (x,y){
  let result=[];
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

	if (k==="c"||k==="e"){
		doPress(5);
		e.preventDefault();
		return false;
	}

	if (k===" "||k==="x"){
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

let pressed=[false,false,false,false,false,false,false];

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

	if (k==="c"||k==="e"){
		pressed[5]=false;
	}

	if (k===" "||k==="x"){
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

highscore = parseInt(localStorage.getItem('musiii_my_max_combo'));
if (Number.isNaN(highscore)){
	highscore=0;
}
resetGame();