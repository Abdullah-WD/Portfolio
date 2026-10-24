(function(){
  var root=document.documentElement,reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  try{var t=localStorage.getItem("theme");if(t)root.setAttribute("data-theme",t);}catch(e){}
  document.getElementById("theme").addEventListener("click",function(){
    var cur=root.getAttribute("data-theme");
    var dark=cur==="dark"||(!cur&&matchMedia("(prefers-color-scheme: dark)").matches);
    var n=dark?"light":"dark";root.setAttribute("data-theme",n);
    try{localStorage.setItem("theme",n);}catch(e){}
  });
  document.getElementById("yr").textContent=new Date().getFullYear();

  /* typing role */
  var roles=["Frontend Web Developer","UI Enthusiast","BSIT Student","Problem Solver"],el=document.getElementById("role"),ri=0,ci=0,del=false;
  function type(){
    var w=roles[ri];
    if(reduce){el.textContent=w;return;}
    el.textContent=w.slice(0,ci);
    if(!del&&ci<w.length){ci++;setTimeout(type,80);}
    else if(!del){del=true;setTimeout(type,1500);}
    else if(ci>0){ci--;setTimeout(type,40);}
    else{del=false;ri=(ri+1)%roles.length;setTimeout(type,300);}
  }
  type();

  /* reveal, bars, counters, timeline */
  function count(s){
    var n=+s.dataset.n,st=null;
    if(reduce){s.textContent=n;return;}
    function f(ts){st=st||ts;var p=Math.min((ts-st)/1200,1);s.textContent=Math.round(n*p);if(p<1)requestAnimationFrame(f);}
    requestAnimationFrame(f);
  }
  var io=new IntersectionObserver(function(es){es.forEach(function(x){
    if(!x.isIntersecting)return;
    var e=x.target;e.classList.add("in");
    e.querySelectorAll(".fill").forEach(function(f){f.style.setProperty("--w",f.dataset.w+"%");f.style.width=f.dataset.w+"%";});
    e.querySelectorAll("[data-n]").forEach(count);
    io.unobserve(e);
  });},{threshold:.2});
  document.querySelectorAll(".rv").forEach(function(e){io.observe(e);});

  /* scroll progress, back to top, active nav */
  var bar=document.getElementById("prog"),tb=document.getElementById("top-btn"),links=document.querySelectorAll("nav a");
  var secs=[].map.call(links,function(a){return document.querySelector(a.getAttribute("href"));});
  function onScroll(){
    var h=root.scrollHeight-innerHeight;
    bar.style.width=(h>0?scrollY/h*100:0)+"%";
    tb.classList.toggle("show",scrollY>600);
    var cur=-1;secs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<innerHeight*.4)cur=i;});
    links.forEach(function(a,i){a.classList.toggle("on",i===cur);});
  }
  addEventListener("scroll",onScroll,{passive:true});onScroll();
  tb.addEventListener("click",function(){scrollTo({top:0});});

  /* portrait follows the pointer slightly */
  var p=document.querySelector(".portrait");
  if(p&&!reduce&&matchMedia("(hover:hover)").matches){
    p.addEventListener("mousemove",function(e){
      var r=p.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      p.style.transform="perspective(900px) rotateY("+x*8+"deg) rotateX("+(-y*8)+"deg)";
    });
    p.addEventListener("mouseleave",function(){p.style.transform="";});
    p.style.transition="transform .3s";
  }

  /* WhatsApp contact: put your number here, country code first, digits only (e.g. 923001234567) */
  var WA_NUMBER="923035036050";
  var waReady=/^\d{10,15}$/.test(WA_NUMBER);
  var waLink=document.getElementById("wa-link"),waNote=document.getElementById("wa-note");
  if(waLink&&waReady)waLink.href="https://wa.me/"+WA_NUMBER+"?text="+encodeURIComponent("Hi Abdullah, I found your portfolio and would like to talk.");
  document.getElementById("form").addEventListener("submit",function(ev){
    ev.preventDefault();
    if(!waReady){waNote.textContent="WhatsApp number is not set yet. Add it in script.js (WA_NUMBER).";return;}
    var d=new FormData(ev.target);
    var text="Hi Abdullah, I’m "+d.get("n")+".\n\n"+d.get("m");
    window.open("https://wa.me/"+WA_NUMBER+"?text="+encodeURIComponent(text),"_blank","noopener");
  });

  /* project previews: use real screenshots from images/ when they exist */
  var exts=["png","jpg","jpeg","webp","PNG","JPG","JPEG","WEBP"];
  document.querySelectorAll(".shot").forEach(function(a){
    var name=a.dataset.img||a.getAttribute("aria-label").replace("Open ","");
    var i=0;
    (function tryNext(){
      if(i>=exts.length)return;
      var im=new Image();
      im.onload=function(){
        var old=a.querySelector(".sc");
        im.className="sc";im.alt="Preview of "+name;
        a.replaceChild(im,old);
      };
      im.onerror=function(){i++;tryNext();};
      im.src="images/"+name+"."+exts[i];
    })();
  });
})();
