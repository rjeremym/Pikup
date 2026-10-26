/*
 * Microsoft Clarity records clicks, scrolling and page content on the live site, so we can see how
 * testers move through the prototype. Only production builds load it; local dev sends nothing.
 *
 * Privacy: Clarity already hides what's typed into text boxes. Anything else that shows text the
 * user wrote (notes, goals, backlog items, topics, account details) carries
 * data-clarity-mask="true" so it's hidden too. Clarity doesn't hide attributes, so keep user text
 * out of aria-label and title (point aria-describedby at the masked text instead).
 */
const CLARITY_PROJECT_ID = "yxo4e8ccda";

/** Clarity's standard tracking snippet, from the project's Settings → Setup page. */
export const CLARITY_SCRIPT = `(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`;

/**
 * UXtweak's tracking snippet for our user study, exactly as UXtweak provides it. It loads on every
 * build, and only does anything for participants who arrive through the study.
 */
export const UXTWEAK_SCRIPT = `(function(u,x,t,w,e,a,k,s){a=function(v){try{u.setItem(t+e,v)}catch(e){}v=JSON.parse(v);for(k=0;k<v.length;k++){s=x.createElement("script");s.text="(function(u,x,t,w,e,a,k){a=u[e]=function(){a.q.push(arguments)};a.q=[];a.t=+new Date;a.c=w;k=x.createElement('script');k.async=1;k.src=t;x.getElementsByTagName('head')[0].appendChild(k)})(window,document,'"+v[k].u+"',"+JSON.stringify(v[k].c)+",'"+v[k].g+"')";x.getElementsByTagName("head")[0].appendChild(s)}};try{k=u.getItem(t+e)}catch(e){}if(k){return a(k)}k=new XMLHttpRequest;k.onreadystatechange=function(){if(k.readyState==4&&k.status==200)a(k.responseText)};k.open("POST",w+e);k.send(x.URL)})(sessionStorage,document,"uxt:","https://api.uxtweak.com/snippet/","91494ce8-63f4-454f-9651-9584d9292785");`;
