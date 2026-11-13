import Script from "next/script";
import { analyticsConfig } from "@/lib/analytics/config";
import { AttributionCapture } from "./AttributionCapture";
import { AutoTracker } from "./AutoTracker";
import { MetaPixelPageView } from "./MetaPixelPageView";

/**
 * Loads GA4, Meta Pixel and the LinkedIn Insight Tag.
 * - GA4: loaded with send_page_view: false; <AutoTracker/> sends every page_view itself
 *   (with page_type / content_group) plus clicks, scroll, sections, engagement and vitals.
 *   In GA4 Admin > Data streams > Enhanced measurement, turn OFF "Page changes based on
 *   browser history events" so client navigations aren't counted twice.
 * - Meta: base code via next/script; PageView on every route is sent by <MetaPixelPageView/>.
 * - LinkedIn: Insight Tag tracks SPA navigation on its own.
 */
export function Analytics() {
  const { enabled, gaId, metaPixelId, linkedinPartnerId } = analyticsConfig;
  if (!enabled) return null;

  return (
    <>
      <AttributionCapture />

      {gaId ? (
        <>
          <Script
            id="ga4-src"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}',{send_page_view:false${analyticsConfig.debug ? ",debug_mode:true" : ""}});`}
          </Script>
        </>
      ) : null}
      <AutoTracker />

      {metaPixelId ? (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');`}
          </Script>
          <MetaPixelPageView />
          <noscript>
            {/* biome-ignore lint/performance/noImgElement: tracking pixel for no-JS visitors */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      ) : null}

      {linkedinPartnerId ? (
        <>
          <Script id="linkedin-insight" strategy="afterInteractive">
            {`_linkedin_partner_id="${linkedinPartnerId}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s)})(window.lintrk);`}
          </Script>
          <noscript>
            {/* biome-ignore lint/performance/noImgElement: tracking pixel for no-JS visitors */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://px.ads.linkedin.com/collect/?pid=${linkedinPartnerId}&fmt=gif`}
            />
          </noscript>
        </>
      ) : null}
    </>
  );
}
