/** Transparent local reading support, deliberately not an automatic grade. */
export function normalize(s) { return s.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function close(a,b) {
 if(a.length<6 || Math.abs(a.length-b.length)>1) return false;
 let i=0,j=0,n=0; while(i<a.length && j<b.length){if(a[i]===b[j]){i++;j++;}else{if(++n>1)return false;if(a.length>=b.length)i++;if(a.length<=b.length)j++;}}
 return n+(a.length-i)+(b.length-j)<=1;
}
export function assess(answer, criteria) {
 const words=normalize(answer).match(/[a-z0-9]+/g)||[];
 const found=criteria.filter(c=>c.terms.some(term=>{
 const t=normalize(term);const prefix=t.endsWith('*');const q=t.replace(/\*$/,'');
 if(q.includes(' '))return normalize(answer).includes(q);
 return words.some(w=>prefix?w.startsWith(q):w===q||close(w,q));
 }));
 return {found:found.map(c=>c.label),missing:criteria.filter(c=>!found.includes(c)).map(c=>c.label)};
}
export function factWarnings(answer, refs=[]) {
 const a=normalize(answer); const warnings=[];
 // Only explicit assertions in the current textual context trigger corrections.
 const clauses=a.split(/[.!?;\n]/).filter(s=>!/(\bnicht\b|\bkein\w*\b|\bweder\b|\bob\b|\bangeblich\b)/.test(s));
 if(clauses.some(s=>/thiel\s+(ist|war|arbeitet als)\s+(ein\s+)?lok(fuehrer|omotivfuehrer)/.test(s)))warnings.push({text:'Thiel ist Bahnwärter. Er überwacht einen Streckenabschnitt; er führt nicht die Lokomotive.',page:3});
 if(clauses.some(s=>/lene\s+(ist|war)\s+(die\s+)?(leibliche\s+)?mutter\s+(von\s+)?tobias/.test(s)))warnings.push({text:'Tobias ist Minnas Sohn. Lene wird durch die zweite Ehe seine Stiefmutter.',page:5});
 if(refs.some(p=>p>=60)&&clauses.some(s=>/thiel\s+(stirbt|begeht selbstmord|toetet sich)/.test(s)))warnings.push({text:'Thiel lebt am Ende. Der Text berichtet zunächst von der Untersuchungshaft und dann von der Aufnahme in die Charité.',page:66});
 return warnings;
}

/** Signals invite revision; presence never proves the argument correct. */
export function reviewWriting(answer) {
 const a = normalize(answer.trim());
 if (!a) return ['Noch kein Entwurf vorhanden. Notiere zunächst einen konkreten Befund; die Lösungsperspektiven bleiben auch ohne Eingabe zugänglich.'];
 const feedback = [];
 if (/(?:\bs\.|\bseite|\btextseite)\s*\d+|\b\d{1,2}:\d{2}\b|§\s*\d+|\bspur\s*\d+|\baphorismus\s*\d+/.test(a)) feedback.push('Ein Fundstellensignal ist vorhanden. Prüfe, ob dort genau deine Beobachtung steht; eine Seitenzahl allein belegt die Folgerung noch nicht.');
 else feedback.push('Eine genaue Fundstelle ist noch nicht erkennbar. Ergänze Textseite, Filmzeit, Spurennummer oder den Abschnitt der historischen Quelle. Bei einem reinen Fundstellenfeld genügt diese Angabe.');
 if (/\b(weil|denn|deshalb|daher|dadurch|folglich|insofern)\b|daraus folgt/.test(a)) feedback.push('Ein Begründungszusammenhang ist sprachlich erkennbar. Trägt der genannte Beleg diesen Schluss, oder fehlt ein Zwischenschritt?');
 else feedback.push('Der Schritt vom Befund zur Aussage bleibt sprachlich offen. Erkläre bei einer Deutungsfrage, warum gerade dieses Detail deinen Schluss stützt. Bei einer blossen Beobachtung ist noch keine Deutung nötig.');
 if (/\b(aber|jedoch|hingegen|unklar|offen|vermutlich|moeglich|vielleicht|nicht belegt)\b|laesst sich nicht/.test(a)) feedback.push('Eine Einschränkung oder Gegenposition ist erkennbar. Benenne auch, welcher zusätzliche Befund die offene Frage klären könnte.');
 else feedback.push('Prüfe die Reichweite deiner Aussage: Was ist beobachtet, was erschlossen? Ergänze bei einer Interpretation eine konkrete Grenze oder Gegenlesart.');
 if (/\b(schizophren|schizophrenie)\b/.test(a)) feedback.push('Begriffsprüfung: Wird „Schizophrenie“ als moderne Hypothese oder als gesicherter Befund verwendet? Die Quellenakte erläutert die spätere Begriffsgeschichte; die Novelle liefert keine klinische Diagnose.');
 for (const w of factWarnings(answer, [66])) feedback.push(`Sachhinweis: ${w.text} Nachlesen: Text S. ${w.page}.`);
 return feedback;
}
