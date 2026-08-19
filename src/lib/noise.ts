/**
 * Procedural ambient loop (soft filtered brown noise, rain-like) — generated
 * entirely with the Web Audio API so the app needs no bundled audio asset.
 */
export function createAmbientEngine() {
  let ctx: AudioContext | null = null;
  let source: AudioBufferSourceNode | null = null;
  let gain: GainNode | null = null;
  let playing = false;

  function buildLoopBuffer(audioCtx: AudioContext): AudioBuffer {
    const seconds = 6;
    const length = audioCtx.sampleRate * seconds;
    const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    // crossfade the loop seam so it doesn't click/pop
    const fade = Math.floor(audioCtx.sampleRate * 0.5);
    for (let i = 0; i < fade; i++) {
      const t = i / fade;
      data[i] = data[i] * t + data[length - fade + i] * (1 - t);
    }
    return buffer;
  }

  async function start() {
    if (playing) return;
    playing = true;
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') await ctx.resume();

    const src = ctx.createBufferSource();
    src.buffer = buildLoopBuffer(ctx);
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 850;

    const g = ctx.createGain();
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 1.2);

    src.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    src.start();

    source = src;
    gain = g;
  }

  function stop() {
    playing = false;
    if (!ctx || !gain || !source) return;
    const activeCtx = ctx;
    const activeGain = gain;
    const activeSource = source;
    const now = activeCtx.currentTime;
    activeGain.gain.cancelScheduledValues(now);
    activeGain.gain.setValueAtTime(activeGain.gain.value, now);
    activeGain.gain.linearRampToValueAtTime(0, now + 0.4);
    setTimeout(() => {
      try {
        activeSource.stop();
      } catch {
        // already stopped
      }
    }, 450);
    source = null;
    gain = null;
  }

  return { start, stop };
}
