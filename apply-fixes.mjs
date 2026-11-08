// Run from your site root:  node apply-fixes.mjs
// Makes 5 small edits (logo CSS in style.css and index.html, seamless wave in calculator.html / calculator-extra.js / calculator-extra.css).
// Each file is backed up as *.bak. If a file doesn't match what the script expects, that step is SKIPPED and reported.
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
const edit = (file, fn) => {
  if (!existsSync(file)) return console.log('SKIPPED (file not found):', file);
  const before = readFileSync(file, 'utf8'); let after;
  try { after = fn(before); } catch (e) { return console.log('SKIPPED', file, '->', e.message); }
  if (after === before) return console.log('already applied:', file);
  copyFileSync(file, file + '.bak'); writeFileSync(file, after); console.log('updated:', file);
};
const must = (s, re, label) => { if (!(typeof re === 'string' ? s.includes(re) : re.test(s))) throw new Error('could not find ' + label); };

edit('assets/css/style.css', s => s.includes('/* HHF-LOGO-PATCH */') ? s : s + `
/* HHF-LOGO-PATCH */
/* Header: transparent logo with a soft glow so it reads on the translucent navbar */
.logo img{background:none;filter:drop-shadow(0 1px 1px rgba(255,255,255,.85)) drop-shadow(0 6px 14px rgba(61,29,107,.18));transition:transform .3s ease,filter .3s ease}
.logo a:hover img{transform:translateY(-1px) scale(1.02)}
/* Footer: same image box, but the gold artwork is painted instead of the purple one */
.footer-about img{background:url('../images/logo-footer.webp') center / contain no-repeat;object-fit:none;object-position:9999px 0;filter:drop-shadow(0 4px 18px rgba(233,199,101,.28))}
`);

// index.html carries its own inlined <style> block, so it needs the same logo rules (image path is relative to the page).
edit('index.html', s => {
  if (s.includes('/* HHF-LOGO-PATCH */')) return s;
  const start = s.indexOf('<style>'); must(s, '<style>', 'inline <style> block');
  const end = s.indexOf('</style>', start); must(s.slice(start), '</style>', 'end of inline <style>');
  const css = "/* HHF-LOGO-PATCH */.logo img{background:none;filter:drop-shadow(0 1px 1px rgba(255,255,255,.85)) drop-shadow(0 6px 14px rgba(61,29,107,.18))}.footer-about img{background:url('assets/images/logo-footer.webp') center/contain no-repeat;object-fit:none;object-position:9999px 0;filter:drop-shadow(0 4px 18px rgba(233,199,101,.28))}";
  return s.slice(0, end) + css + s.slice(end);
});

edit('calculator.html', s => {
  if (s.includes('function waveLayer(')) return s;
  must(s, 'function svgEl(tag,attrs,parent,text){', 'svgEl helper');
  const helper = `function waveLayer(parent,clipId,left,right,y,amp,lam,cls){
 /* Seamless wave: static clip wrapper, inner group slides exactly one wavelength (CSS), so the loop never shows an edge. */
 const wrap=svgEl('g',{'clip-path':\`url(#\${clipId})\`},parent),slide=svgEl('g',{class:'wave-slide',style:\`--wl:\${lam}px\`},wrap);
 const x0=left-2*lam,n=Math.ceil((right-left)/(lam/2))+10;let d=\`M \${x0} \${y} Q \${x0+lam/4} \${y-amp*2} \${x0+lam/2} \${y}\`;
 for(let i=1;i<n;i++)d+=\` T \${x0+lam/2*(i+1)} \${y}\`;
 d+=\` L \${x0+lam/2*n} \${y+14} L \${x0} \${y+14} Z\`;svgEl('path',{d,class:cls},slide);}
window.hhWaveLayer=waveLayer;
`;
  const i = s.indexOf('function svgEl(tag,attrs,parent,text){'), j = s.indexOf('\n', i) + 1;
  let out = s.slice(0, j) + helper + s.slice(j);
  const g = /   svgEl\('path',\{d:`M \$\{left-10\} \$\{gy\}.*?class:'tank-liquid-wave ghost-fill','clip-path':'url\(#tankClip\)'\},g\);\}/;
  const r = /if\(ratio>\.01\)svgEl\('path',\{d:`M \$\{left-10\} \$\{ly\}.*?class:'tank-liquid-wave','clip-path':'url\(#tankClip\)'\},g\);\}/;
  must(out, g, 'ghost wave line'); must(out, r, 'liquid wave line');
  return out.replace(g, () => "   waveLayer(g,'tankClip',left,right,gy,7,Math.max(70,w/2.5),'tank-liquid-wave ghost-fill');}")
            .replace(r, () => "if(ratio>.01&&ratio<.995)waveLayer(g,'tankClip',left,right,ly,5,Math.max(70,w/2.5),'tank-liquid-wave');}");
});

edit('assets/js/calculator-extra.js', s => {
  if (s.includes('window.hhWaveLayer(')) return s;
  const g = /      svgEl\('path', \{ d: `M \$\{left - 10\} \$\{gy\}.*?class: 'tank-liquid-wave ghost-fill', 'clip-path': 'url\(#xsClip\)' \}, g\);/;
  const r = /if \(ratio > \.01 && ratio < \.995\) svgEl\('path', \{ d: `M \$\{left - 10\} \$\{ly\}.*?class: 'tank-liquid-wave', 'clip-path': 'url\(#xsClip\)' \}, g\);/;
  must(s, g, 'ghost wave line'); must(s, r, 'liquid wave line');
  return s.replace(g, () => "      window.hhWaveLayer(g, 'xsClip', left, right, gy, 7, Math.max(70, w / 2.5), 'tank-liquid-wave ghost-fill');")
          .replace(r, () => "if (ratio > .01 && ratio < .995) window.hhWaveLayer(g, 'xsClip', left, right, ly, 5, Math.max(70, w / 2.5), 'tank-liquid-wave');");
});

edit('assets/css/calculator-extra.css', s => {
  if (s.includes('xs-wave-slide')) return s;
  const old = ".tank-liquid-wave.ghost-fill { animation: xs-wave 5s ease-in-out infinite alternate; }\n@keyframes xs-wave { from { transform: translateX(-14px); } to { transform: translateX(14px); } }\n";
  must(s, old, 'old wave rule');
  return s.replace(old, () => `.wave-slide { animation: xs-wave-slide 6s linear infinite; will-change: transform; }
@keyframes xs-wave-slide { from { transform: translateX(0); } to { transform: translateX(calc(var(--wl, 80px) * -1)); } }
.wave-slide .tank-liquid-wave { fill: rgba(255, 255, 255, .34); }
.wave-slide .tank-liquid-wave.ghost-fill { opacity: .6; }
`).replace(".tank-liquid-wave.ghost-fill, .tank-outline.is-ref, .empty-cta { animation: none !important; }", ".wave-slide, .tank-outline.is-ref, .empty-cta { animation: none !important; }");
});
