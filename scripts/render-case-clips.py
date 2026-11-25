"""Extract the investigation's three film exhibits: python3 scripts/render-case-clips.py SOURCE.mp4."""
import json, subprocess, sys
from pathlib import Path
out = Path(__file__).resolve().parents[1] / 'public/media/fall'
out.mkdir(parents=True, exist_ok=True)
clips = [
    dict(id='wohnung', start=3955, end=3968, poster=3965),
    dict(id='gleise', start=4034, end=4048, poster=4035),
    dict(id='anstalt', start=4148, end=4164, poster=4149),
]
for c in clips:
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(c['start']),'-i',sys.argv[1],'-t',str(c['end']-c['start']),'-map','0:v:0','-map','0:a:0','-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart',str(out/(c['id']+'.mp4'))],check=True)
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(c['poster']),'-i',sys.argv[1],'-frames:v','1','-q:v','2',str(out/(c['id']+'.jpg'))],check=True)
(out/'manifest.json').write_text(json.dumps(dict(source='Bahnwärter Thiel, DEFA 1982; bereitgestellte Filmfassung, 72:20',timebase='seconds from source beginning',speed=1,clips=clips),ensure_ascii=False,indent=2)+'\n')
