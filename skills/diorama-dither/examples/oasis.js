Pixel.scene({
  name:'oasis',
  title:'The desert oasis',
  means:'An oasis at dusk: a pool, palms, a cloth tent, a well and a camel. Tap the fire and the flames climb.',
  hint:'Hover the guide, the traveler or the camel; tap the fire to lift the flames.',
  width:360,height:280,duration:8,still:2,fps:12,
  bayer:4,shadow:'hard',rim:true,wind:8,contact:.4,
  folkZoom:['guide','traveler'],
  camera:{ az:45,el:30,height:.92,scale:58 },
  sun:Dither.sun(45,38,16),
  ground:{
    rx:3.9,rz:2.95,wobble:.34,fade:.32,
    zone:function (x,z) {
      var dx = (x + 1.2) / .75,dz = (z - .9) / .52;
      if (dx * dx + dz * dz < 1) return 'pond';
      return 'sand';
    }
  },
  materials:'sand pond stone rock timber beam sail sack leaf coal ember hide ray'.split(' ').reduce(function (m,n) {
    m[n] = Dither.mat(n); return m;
  },{
    canvas:Dither.mat('sail',{ stripe:.18,alt:'#a33b32' }),
    trunk:Dither.mat('beam',{ grain:'y' })
  }),
  build:function (P) {
    var parts = { plants:[] },S = Dither.seat,A = Dither.afloat;
    var b = function (w,h,d,m,x,y,z,p,n,o,j) { return S(P.box(w,h,d,m,x,y,z,p),n,o,j); };
    function palm(x,z,turn) {
      var g = P.group(x,0,z),i;
      g.base = [x,0,z];
      var trunk = P.cyl(.045,.08,1.26,'trunk',0,.63,0,g,6);
      S(trunk,'trunk');
      var crown = b(.22,.16,.22,'leaf',0,1.3,0,g,'crown',trunk);
      for (i = 0; i < 6; i++) {
        var fr = P.group(0,1.32,0,g);
        fr.rotation.y = turn + i * Math.PI / 3;
        fr.rotation.z = -.48;
        var inner = b(.42,.045,.16,'leaf',.1,0,0,fr,'frond',crown);
        var tip = P.group(.24,0,0,fr);
        tip.rotation.z = -.42;
        b(.38,.035,.12,'leaf',.12,0,0,tip,'frond',inner);
      }
      parts.plants.push(g);
    }
    palm(-1.9,-.25,.4);
    palm(-1.15,-1.15,.8);

    var tent = P.group(.15,0,-.55);
    tent.rotation.y = -.5;
    var mast = b(.09,1.28,.09,'beam',0,.64,-.04,tent,'mast');
    var ridge = b(1.36,.08,.12,'beam',0,1.06,-.04,tent,'ridge',mast);
    function slope(sign) {
      var g = P.group(0,1.06,-.04,tent);
      g.rotation.x = sign * .95;
      return b(1.28,.04,1.44,'canvas',0,0,sign * .58,g,'canvas',ridge);
    }
    slope(1);
    slope(-1);
    b(.05,1.02,.72,'canvas',-.66,.52,-.04,tent,'back',ridge);
    b(1.15,.03,1.2,'sack',-.05,.015,.02,tent,'rug');

    var well = P.group(-.15,0,1.4);
    var drum = P.cyl(.26,.3,.36,'stone',0,.18,0,well,8);
    S(drum,'well');
    var lip = P.cyl(.34,.34,.08,'rock',0,.4,0,well,8);
    S(lip,'well-lip',drum);
    var post = b(.06,.46,.06,'beam',-.18,.64,0,well,'well-post',lip);
    b(.06,.46,.06,'beam',.18,.64,0,well,'well-post',lip);
    var bar = b(.48,.06,.56,'beam',0,.9,.14,well,'well-bar',post);
    var rope = b(.05,.36,.08,'beam',.06,.7,.36,well,'rope',bar);
    var bucket = P.cyl(.07,.06,.12,'timber',.06,.5,.44,well,6);
    S(bucket,'bucket',rope);
    [[-1.2,.9],[-1.42,.78],[-.98,1.02]].forEach(function (p) {
      b(.18,.04,.08,'sail',p[0],.02,p[1],null,'crest','surface');
    });

    var fire = P.group(.85,0,.35);
    fire.name = 'fire';
    parts.fire = fire;
    var bed = b(.34,.08,.28,'coal',0,.04,0,fire,'coals');
    for (var i = 0; i < 5; i++) {
      var a = i / 5 * Math.PI * 2;
      b(.12,.1,.1,'rock',Math.cos(a) * .24,.05,Math.sin(a) * .2,fire,'hearth');
    }
    b(.1,.22,.08,'ember',0,.19,0,fire,'flame',bed);
    b(.07,.14,.06,'ember',-.08,.15,.02,fire,'flame',bed);
    b(.06,.16,.05,'ember',.08,.16,-.02,fire,'flame',bed);
    parts.flare = [
      b(.18,.52,.12,'ember',0,.34,0,fire,'flare',bed),
      b(.1,.32,.08,'ember',.04,.24,.02,fire,'flare',bed)
    ];
    parts.sparks = [0,1,2,3,4,5].map(function (k) {
      var big = k % 2 === 0,ang = k / 6 * Math.PI * 2;
      var s = P.box(big ? .12 :.07,big ? .11 :.08,big ? .07 :.05,k % 2 ? 'ember' :'ray',0,.32,0,fire);
      s.dir = [Math.cos(ang),Math.sin(ang)];
      return A(s,'spark','spark');
    });
    parts.smoke = [0,1,2].map(function (k) {
      var g = P.group(0,.6,0,fire);
      P.box(.26 - k * .04,.13,.2 - k * .03,'sail',0,0,0,g);
      g.phase = k / 3;
      return A(g,'smoke','smoke');
    });

    var camel = P.group(-.55,0,.05);
    camel.rotation.y = 3.5;
    camel.name = 'camel';
    var body = P.box(.92,.3,.34,'hide',0,.72,0,camel);
    var leg = null;
    [[-.26,.11],[-.26,-.11],[.2,.11],[.2,-.11]].forEach(function (p) {
      leg = b(.09,.58,.09,'hide',p[0],.29,p[1],camel,'leg',body);
      b(.11,.08,.11,'coal',p[0],.04,p[1],camel,'hoof','ground',leg);
    });
    S(body,'body',leg);
    b(.32,.2,.26,'hide',-.04,.94,0,camel,'hump',body);
    var neck = P.box(.14,.4,.12,'hide',.36,.82,0,camel);
    neck.rotation.z = -.55;
    S(neck,'neck',body);
    var n2 = P.box(.12,.26,.11,'hide',.05,.2,0,neck);
    n2.rotation.z = -.4;
    S(n2,'neck',neck);
    var head = b(.24,.12,.12,'hide',.06,.16,0,n2,'head',n2);
    b(.12,.07,.09,'hide',.14,.01,.02,head,'muzzle',head);
    b(.04,.09,.035,'coal',-.02,.1,.05,head,'ear',head);
    b(.04,.09,.035,'coal',-.02,.1,-.05,head,'ear',head);
    b(.05,.22,.04,'coal',-.42,.66,0,camel,'tail',body);

    var guide = Dither.folk(P,.45,1.05,{
      h:.5,yaw:2.4,shirt:'#8e2f2a',pants:'#1c2433',sleeve:'#cbb892',hat:'#1c2433'
    });
    guide.root.name = 'guide';
    parts.guide = guide;
    parts.sack = A(P.box(.11,.08,.13,'sack',0,-.04,.04,guide.handR),'case','carried');
    var traveler = Dither.folk(P,1.05,.85,{
      h:.49,yaw:2.15,shirt:'#2c4f78',pants:'#6b3a2a',sleeve:'#d7c4a2'
    });
    traveler.root.name = 'traveler';
    parts.traveler = traveler;
    parts.hot = [fire,guide.root,traveler.root,camel];
    return parts;
  },
  tick:function (c) {
    var q = c.q,t = c.t,p = c.parts,P = c.P,hot = c.active === p.fire;
    P.pose(p.guide,'hold');
    p.guide.body.rotation.x = .3;
    p.guide.armR.rotation.x = -1.2;
    p.guide.elbowR.rotation.x = -.9;
    p.guide.armL.rotation.x = -.45 + Math.sin(q * P.TAU) * .15;
    p.guide.elbowL.rotation.x = -.4;
    p.sack.position.y = -.04 + Dither.carry(q) * .05;
    P.pose(p.traveler,'work');
    p.traveler.body.rotation.x = .34;
    p.traveler.armR.rotation.x = -1.25;
    p.traveler.elbowR.rotation.x = -.75;
    p.traveler.armL.rotation.x = -1.05;
    p.traveler.elbowL.rotation.x = -.55;
    p.flare.forEach(function (f) { f.visible = hot; });
    var u = ((q + .795) * 2) % 1,live = u < .18,k = live ? u / .18 :0;
    p.sparks.forEach(function (s) {
      s.visible = live;
      s.position.set(s.dir[0] * k * .42,.32 + k * .52 * (1 - k * .3),s.dir[1] * k * .3);
    });
    p.smoke.forEach(function (g) {
      var w = (q + g.phase) % 1;
      g.position.set(Math.sin((q + g.phase) * P.TAU) * .08,.6 + w * .78,w * .18);
    });
    p.plants.forEach(function (g,i) { Dither.sway(P,g,g.base,t,1.5,i * .4); });
    c.read = hot ? 'fire · flames up' :'fire · low embers';
  }
});
