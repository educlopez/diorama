/* Village halt. Smoke leaves the chimney. Tap the master to raise the signal. */
Pixel.scene({
  name:'train-station',
  title:'The village halt',
  means:'A timber platform beside a small steam train. Smoke leaves the chimney, and a tap raises the signal.',
  hint:'Hover the master, the traveler or the cart; tap the master to raise the signal.',
  folkZoom:['master','traveler'],
  width:360,height:280,duration:8,still:2,fps:12,
  bayer:4,shadow:'hard',rim:true,wind:8,contact:.42,
  camera:{az:45,el:30,height:.78,scale:58},
  sun:Dither.sun(45,38,16),
  ground:{rx:3.5,rz:2.65,wobble:.36,fade:.32,rect:true,zone:function(x,z){
    return x>-.4&&x<1.15&&z>.35&&z<1.7?'earth':'meadow';
  }},
  materials:'meadow earth moss stone timber beam tile sail sack iron coal leaf cart paper'.split(' ').reduce(function(m,n){
    m[n]=Dither.mat(n);return m;
  },{deck:Dither.mat('timber',{grain:'z'}),blade:Dither.mat('sail',{stripe:.14,alt:'#a33b32'})}),
  build:function(P){
    var S=Dither.seat,A=Dither.afloat,parts={plants:[]};
    var b=function(w,h,d,m,x,y,z,p,n,o,j){return S(P.box(w,h,d,m,x,y,z,p),n,o,j);};
    var ix=2.75,iz=2.05,post=null,back=null;
    [[0,-iz,ix*2,0],[-ix,0,iz*2,1.5708],[ix,0,iz*2,1.5708],[-1.35,iz,2.8,0],[1.92,iz,1.65,0]].forEach(function(w){
      Dither.wall(P,w[0],w[1],w[2],w[3]);
    });
    Dither.gate(P,.55,iz,0);
    var halt=P.group(-1.25,0,.28);halt.rotation.y=.68;
    var deck=b(2.3,.12,1.08,'deck',0,.06,0,halt,'deck');
    [[-.92,-.38],[.92,-.38],[-.92,.38],[.92,.38]].forEach(function(p,i){
      var n=b(.08,.64,.08,'beam',p[0],.44,p[1],halt,'post',deck);
      if(i<2)back=n;else post=n;
    });
    var front=b(1.96,.07,.08,'beam',0,.795,.38,halt,'beam',post);
    b(1.96,.07,.08,'beam',0,.795,-.38,halt,'beam',back);
    var roof=b(2.12,.05,1.02,'tile',0,.855,0,halt,'roof',front);
    var leg=b(.04,.18,.04,'beam',-.66,.21,-.16,halt,'leg',deck);
    b(.04,.18,.04,'beam',-.3,.21,-.16,halt,'leg',deck);
    var bench=b(.48,.04,.16,'timber',-.48,.3,-.12,halt,'bench',leg);
    b(.48,.16,.04,'timber',-.48,.4,-.2,halt,'back',bench);
    var clock=P.group(.88,0,-.2,halt);
    var face=P.cyl(.08,.08,.04,'paper',0,.7,.05,clock,8);face.rotation.x=Math.PI/2;
    S(face,'clock',b(.07,.58,.07,'beam',0,.41,0,clock,'post',deck));
    parts.minute=P.group(0,.72,.072,clock);
    b(.02,.09,.02,'iron',0,.04,0,parts.minute,'hand',face);
    parts.hour=P.group(0,.72,.078,clock);
    b(.07,.02,.02,'iron',.03,0,0,parts.hour,'hand',face);
    var sig=P.group(-.35,0,.78,halt);
    parts.arm=P.group(0,.78,.04,sig);
    b(.05,.1,.48,'blade',0,0,.2,parts.arm,'signal',b(.08,.86,.08,'beam',0,.43,0,sig,'post'));
    var master=Dither.folk(P,-.22,.22,{
      h:.42,yaw:Math.PI/2,name:'master',parent:halt,on:deck,shirt:'#8e2f2a',pants:'#1c2433',sleeve:'#cbb892',hat:'#1c2433'
    });
    var traveler=Dither.folk(P,.08,.36,{
      h:.4,yaw:2.05,name:'traveler',parent:halt,on:deck,shirt:'#2c4f78',pants:'#6b3a2a',sleeve:'#d7c4a2'
    });
    master.root.name='master';
    parts.master=master;parts.traveler=traveler;
    parts.grip=A(P.box(.11,.08,.13,'sack',0,-.06,.05,traveler.handR),'case','carried');
    var train=P.group(.05,0,1.02);train.rotation.y=.95;
    var hy=.24,fy=.29,by=.43,cz=.2,axle=null,pin=null,sleeper=null;
    [-1.05,-.4,.25,.85,1.35].forEach(function(x){sleeper=b(.12,.05,.58,'timber',x,.025,0,train,'sleeper');});
    var railN=b(2.6,.04,.06,'iron',.15,.07,cz,train,'rail',sleeper);
    var railF=b(2.6,.04,.06,'iron',.15,.07,-cz,train,'rail',sleeper);
    function wheels(xs){
      xs.forEach(function(x){
        var ax=P.box(.05,.05,.52,'iron',x,hy,0,train),near=null;
        [cz,-cz].forEach(function(z,i){
          var w=P.cyl(.15,.15,.07,'iron',x,hy,z,train,10);w.rotation.x=Math.PI/2;
          S(w,'cart-wheel',i?railF:railN,ax);if(!i)near=w;
        });
        S(ax,'axle',near);axle=ax;if(x<0&&!pin)pin=near;
      });
    }
    wheels([-.42,-.08]);
    var frame=b(.92,.08,.26,'iron',-.22,fy,0,train,'frame',axle);
    var boiler=P.cyl(.12,.12,.62,'iron',-.28,by,0,train,8);boiler.rotation.z=Math.PI/2;
    S(boiler,'boiler',frame);
    var cab=b(.38,.38,.3,'timber',.1,.52,0,train,'cab',frame);
    b(.12,.1,.04,'paper',.1,.56,.16,train,'window',cab);
    S(P.cyl(.06,.07,.28,'coal',-.48,by+.2,0,train,6),'stack',boiler);
    b(.46,.04,.04,'iron',-.25,hy+.08,.23,train,'rod',pin);
    b(.04,.12,.04,'iron',-.42,hy+.05,.23,train,'crank',pin);
    parts.smoke=[0,1,2].map(function(i){
      var g=P.group(-.48,.88,0,train);
      P.box(.26-i*.04,.13,.2-i*.03,'sail',0,0,0,g);
      g.phase=i/3;g.base=[-.48,.88,0];return A(g,'smoke','smoke');
    });
    wheels([.64,1.08]);
    var bed=b(.98,.08,.28,'cart',.88,fy,0,train,'bed',axle);
    var coach=b(.9,.42,.34,'cart',.9,.54,0,train,'coach',bed);
    b(.96,.06,.4,'beam',.9,.78,0,train,'roof',coach);
    b(.24,.06,.08,'iron',.34,fy,0,train,'link',frame,bed);
    var cart=P.group(-1.55,0,1.22);cart.rotation.y=.85;cart.name='cart';S(cart,'cart');
    var cr=.1,cax=null;
    [-.22,.2].forEach(function(x){
      cax=P.box(.06,.05,.46,'timber',x,cr,0,cart);
      [-.2,.2].forEach(function(z){
        var w=P.cyl(cr,cr,.06,'iron',x,cr,z,cart,10);w.rotation.x=Math.PI/2;
        S(w,'cart-wheel','ground',cax);
      });
      S(cax,'axle',cart);
    });
    var cbed=b(.62,.06,.32,'cart',0,cr+.06,0,cart,'bed',cax);
    b(.62,.14,.04,'cart',0,cr+.14,.16,cart,'side',cbed);
    b(.62,.14,.04,'cart',0,cr+.14,-.16,cart,'side',cbed);
    b(.16,.12,.14,'sack',-.06,cr+.16,0,cart,'load',cbed);
    parts.plants=Dither.fringe(P,[[2.15,1.15],[-2.2,-1.15],[1.65,-1.35],[-2.05,.85]]);
    parts.plants.push(Dither.tree(P,-1.9,-1.2,{r:.38,h:.66,clusters:4,seed:4}));
    parts.plants.push(Dither.bush(P,2,-.8,.2),Dither.bush(P,-2.15,.2,.18));
    parts.hot=[master.root,traveler.root,cart];
    return parts;
  },
  tick:function(c){
    var q=c.q,p=c.parts,P=c.P,up=c.active===p.master.root,w=Math.sin(q*P.TAU);
    p.arm.rotation.x=up?-1.25:.1;
    p.minute.rotation.z=-q*P.TAU;p.hour.rotation.z=p.minute.rotation.z/12;
    p.smoke.forEach(function(g){
      var u=(q+g.phase)%1;
      g.position.set(g.base[0]+Math.sin((q+g.phase)*P.TAU)*.08,g.base[1]+u*.78,g.base[2]+u*.18);
    });
    P.pose(p.master,'stand');
    p.master.body.rotation.x=.14;p.master.head.rotation.y=.4;
    p.master.armR.rotation.z=.6+w*.45;p.master.elbowR.rotation.x=-.9;
    p.master.armL.rotation.x=-.85;p.master.elbowL.rotation.x=-.55;p.master.armL.rotation.z=-.4;
    P.pose(p.traveler,'carry');p.traveler.elbowR.rotation.x=-1.2;p.traveler.armR.rotation.z=.2;
    p.grip.position.y=-.06+Dither.carry(q)*.05;
    p.plants.forEach(function(g,i){Dither.sway(P,g,g.base,c.t,1.5,i*.2);});
    c.read=up?'signal · raised':'halt · waiting';
  }
});
