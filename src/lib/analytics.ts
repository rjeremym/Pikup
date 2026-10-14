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
