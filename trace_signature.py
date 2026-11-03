from PIL import Image, ImageFilter
from collections import deque, defaultdict
from pathlib import Path
import argparse
from xml.sax.saxutils import escape

parser = argparse.ArgumentParser()
parser.add_argument('source')
parser.add_argument('name')
parser.add_argument('output')
parser.add_argument('--rotate', type=int, default=0)
parser.add_argument('--light-ink', action='store_true')
parser.add_argument('--threshold', type=int, default=110)
args = parser.parse_args()
source = Image.open(args.source).convert('L')
if args.rotate:
    source = source.rotate(args.rotate, expand=True)
source = source.filter(ImageFilter.MedianFilter(3))
w, h = source.size
pixels = source.load()
ink = {(x, y) for y in range(h) for x in range(w)
       if (pixels[x, y] > args.threshold if args.light_ink else pixels[x, y] < args.threshold)}
kept = set()
while ink:
    seed = ink.pop()
    component = {seed}
    queue = deque([seed])
    while queue:
        x, y = queue.popleft()
        for p in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
            if p in ink:
                ink.remove(p)
                component.add(p)
                queue.append(p)
    touches_edge = any(x in (0,w-1) or y in (0,h-1) for x,y in component)
    if len(component) >= 20 and not touches_edge:
        kept.update(component)
assert kept, 'No signature detected'
left = min(x for x,y in kept)-10
top = min(y for x,y in kept)-10
width = max(x for x,y in kept)-left+11
height = max(y for x,y in kept)-top+11
edges = defaultdict(set)
for x,y in kept:
    if (x,y-1) not in kept: edges[(x,y)].add((x+1,y))
    if (x+1,y) not in kept: edges[(x+1,y)].add((x+1,y+1))
    if (x,y+1) not in kept: edges[(x+1,y+1)].add((x,y+1))
    if (x-1,y) not in kept: edges[(x,y+1)].add((x,y))
loops=[]
while edges:
    start=next(iter(edges))
    loop=[start]
    point=start
    while True:
        nxt=edges[point].pop()
        if not edges[point]: del edges[point]
        point=nxt
        if point==start: break
        loop.append(point)
    loops.append(loop)

def simplify(points, tolerance=.65):
    if len(points)<3: return points
    ax,ay=points[0]; bx,by=points[-1]
    dx,dy=bx-ax,by-ay
    denom=dx*dx+dy*dy
    distances=[]
    for x,y in points[1:-1]:
        t=max(0,min(1,((x-ax)*dx+(y-ay)*dy)/denom)) if denom else 0
        distances.append((x-ax-t*dx)**2+(y-ay-t*dy)**2)
    far=max(distances)
    if far<=tolerance*tolerance: return [points[0],points[-1]]
    i=distances.index(far)+1
    return simplify(points[:i+1])+simplify(points[i:])[1:]

paths=[]
for loop in loops:
    if len(loop)<6: continue
    mid=len(loop)//2
    pts=simplify(loop[:mid+1])[:-1]+simplify(loop[mid:]+[loop[0]])[:-1]
    pts=[(x-left,y-top) for x,y in pts]
    starts=((pts[-1][0]+pts[0][0])/2,(pts[-1][1]+pts[0][1])/2)
    commands=[f'M{starts[0]:g},{starts[1]:g}']
    for i,(x,y) in enumerate(pts):
        nx,ny=pts[(i+1)%len(pts)]
        commands.append(f'Q{x:g},{y:g} {(x+nx)/2:g},{(y+ny)/2:g}')
    paths.append(' '.join(commands)+' Z')
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" fill="none"><title>{escape(args.name)} signature</title><path fill="#FF36B9" fill-rule="evenodd" d="'+ ' '.join(paths)+'"/></svg>\n'
Path(args.output+'.svg').write_text(svg,encoding='utf-8')
preview=Image.new('RGB',(width,height),'#0F1026')
for x,y in kept: preview.putpixel((x-left,y-top),(255,54,185))
preview.resize((width*2,height*2)).save(args.output+'-preview.png')
print(f'Created SVG: {width}x{height}, {len(paths)} contours, {len(svg)} bytes')
