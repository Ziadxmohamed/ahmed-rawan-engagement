"""Our Next Chapter: an original 54-second piano/strings miniature.
No recordings, samples or third-party melodies. Requires NumPy only to rebuild.
The published M4A is pre-rendered; guests and Vite builds do not need Python.
"""
from pathlib import Path
import wave
import numpy as np

RATE = 44100
BEAT = 60 / 80
BAR = 3 * BEAT
BARS = 24
COUNT = round(BARS * BAR * RATE)
rng = np.random.default_rng(13112026)
mix = np.zeros((COUNT, 2), dtype=np.float64)

def frequency(midi):
    return 440 * 2 ** ((midi - 69) / 12)

def add(waveform, start, gain, pan):
    begin = int(start * RATE) % COUNT
    count = min(len(waveform), COUNT)
    signal = waveform[:count, None] * gain * np.array([np.cos(pan*np.pi/2), np.sin(pan*np.pi/2)])[None, :]
    split = min(count, COUNT-begin)
    mix[begin:begin+split] += signal[:split]
    if split<count:
        mix[:count-split] += signal[split:]

def piano(note, start, gain=.12, length=3.8, pan=.5):
    t = np.arange(int(RATE*length)) / RATE
    f = frequency(note)
    sound = np.zeros_like(t)
    for harmonic, weight in [(1,.72),(2,.24),(3,.10),(4,.048),(5,.025),(7,.009)]:
        pitch=f*harmonic*np.sqrt(1+.00012*harmonic*harmonic)
        sound += weight*np.cos(2*np.pi*pitch*t) * np.exp(-t/(2.0/harmonic**.52))
    sound *= (1-np.exp(-t/.008)) * np.minimum(1,(length-t)/.12)
    add(sound, start, gain, pan)

def strings(notes, start, duration, gain=.017):
    t = np.arange(int((duration+1.3)*RATE)) / RATE
    envelope=np.minimum(1,t/.65)*np.minimum(1,np.maximum(0,duration+1.3-t)/1.3)
    sound=np.zeros_like(t)
    for i,note in enumerate(notes):
        f=frequency(note)
        for harmonic in range(1,6):
            detune=1.0008 if i%2 else .9993
            sound += np.sin(2*np.pi*f*detune*harmonic*t + .025*np.sin(t*3.8))/(harmonic**2)
    sound *= envelope / len(notes)
    add(sound,start,gain,.54)

chords=[
 [48,55,60,64,67,74], [47,55,59,62,67,74],
 [45,52,57,60,64,71], [41,48,53,57,60,64],
 [38,45,50,53,57,64], [43,50,55,60,62,67],
 [40,47,52,55,59,64], [41,48,53,57,60,67]
]
# A written melody, with space for the arpeggios and a quieter middle phrase.
melody=[
 [(76,0,1.5),(79,1.5,1.5)],[(81,0,2),(79,2,1)],
 [(76,0,1.5),(74,1.5,1.5)],[(72,0,3)],
 [(74,0,1.5),(77,1.5,1.5)],[(79,0,2),(74,2,1)],
 [(76,0,1),(74,1,1),(72,2,1)],[(71,0,1.5),(72,1.5,1.5)],
 [(72,0,3)],[(74,.5,2.5)],[(76,0,3)],[(69,0,3)],
 [(74,0,2),(72,2,1)],[(71,0,3)],[(67,0,3)],[(69,0,1.5),(71,1.5,1.5)],
 [(76,0,1.5),(79,1.5,1.5)],[(81,0,2),(83,2,1)],
 [(84,0,2),(81,2,1)],[(79,0,1.5),(76,1.5,1.5)],
 [(77,0,1.5),(74,1.5,1.5)],[(79,0,2),(74,2,1)],
 [(76,0,1.5),(74,1.5,1.5)],[(72,0,3)]
]
for bar in range(BARS):
    chord=chords[bar%8]
    if bar==23: chord=chords[0]
    start=bar*BAR
    piano(chord[0]-12,start,.10,4.2,.32)
    pattern=[1,2,3,4,3,2] if bar%2==0 else [1,3,2,4,2,3]
    for step,index in enumerate(pattern):
        piano(chord[index],start+step*BEAT/2+rng.uniform(-.006,.006),.045*(1.08 if step==0 else .9),3.2,.35+.3*(step/5))
    for note,offset,beats in melody[bar]:
        piano(note,start+offset*BEAT,.077 if bar<8 or bar>=16 else .055,max(2.8,beats*BEAT+1.2),.57)
    strings([chord[2],chord[3],chord[4]],start,BAR,.026 if 8<=bar<22 else .017)
    if bar in (0,7,16,23): piano(chord[-1]+12,start+.10,.018,4.8,.7)
# Soft stereo room reflections. Circular tails make the composed loop continuous.
dry=mix.copy()
for seconds,amount in [(.071,.12),(.113,.10),(.179,.075),(.257,.06),(.401,.048),(.631,.032),(1.07,.02)]:
    mix += np.roll(dry[:,::-1],int(seconds*RATE),axis=0)*amount
mix-=mix.mean(axis=0)
mix=np.tanh(mix*1.2)
mix *= .84 / np.max(np.abs(mix))
Path('artifacts').mkdir(exist_ok=True)
with wave.open('artifacts/our-next-chapter.wav','wb') as out:
    out.setnchannels(2);out.setsampwidth(2);out.setframerate(RATE)
    out.writeframes((mix*32767).astype('<i2').tobytes())
print(f'Original composition: {COUNT/RATE:.1f}s stereo, peak {np.max(np.abs(mix)):.2f}, no clipped samples.')
