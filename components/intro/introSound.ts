/**
 * Audio for the construction intro, synthesised rather than sampled — no files
 * to load and nothing to cache.
 *
 * The score is deliberately sparse: the room opening as the site is set out,
 * scaffolding running while the plan goes up, and the mark landing as weight
 * rather than as a chime. Nothing else. There are no sweeps and no bells.
 *
 * Browsers refuse to start audio without a user gesture, so nothing here makes
 * a sound until `unlock()` is called from a real click.
 */

type ClickOpts = { count?: number; rate?: number; freq?: number; gain?: number; pan?: number };

export interface IntroSound {
  unlock(): Promise<boolean>;
  mute(): void;
  readonly running: boolean;
  bedLevel(level: number, ramp?: number): void;
  draw(): void;
  scaffold(busy: number, pan: number): void;
  /** Seconds to wait before the next scaffolding burst at this activity. */
  burstGap(activity: number): number;
  mark(): void;
  close(): void;
}

export function createIntroSound(): IntroSound {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let verb: ConvolverNode | null = null;
  let noise: AudioBuffer | null = null;
  let bed: GainNode | null = null;
  let bedFilter: BiquadFilterNode | null = null;
  let enabled = true;

  function ensure(): AudioContext | null {
    if (ctx) return ctx;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();

    // A limiter, then a fixed trim. Loudness follows RMS, not peak: without
    // limiting, the only way to raise the average level of short clicks is to
    // raise their peaks, which clips. With it the bus can be driven hard.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -10;
    limiter.knee.value = 4;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.18;
    const trim = ctx.createGain();
    trim.gain.value = 0.86; // ~1.3 dB of guaranteed headroom
    limiter.connect(trim);
    trim.connect(ctx.destination);

    master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(limiter);

    // A short plate. Most of the warmth is this.
    verb = ctx.createConvolver();
    const len = Math.floor(ctx.sampleRate * 1.9);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.6) * Math.min(1, t * 26);
      }
    }
    verb.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.34;
    verb.connect(wet);
    wet.connect(master);

    const n = ctx.sampleRate;
    noise = ctx.createBuffer(1, n, n);
    const d = noise.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;

    return ctx;
  }

  const now = () => (ctx ? ctx.currentTime : 0);
  const live = () => enabled && !!ctx && ctx.state === "running";

  function route(node: AudioNode, pan: number, send: number) {
    if (!ctx || !master || !verb) return;
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    node.connect(p);
    p.connect(master);
    if (send > 0) {
      const s = ctx.createGain();
      s.gain.value = send;
      p.connect(s);
      s.connect(verb);
    }
  }

  function noiseSrc(): AudioBufferSourceNode {
    const s = ctx!.createBufferSource();
    s.buffer = noise;
    s.loop = true;
    return s;
  }

  /** One click of the ratchet, scheduled against the audio clock. */
  function click(t: number, freq: number, gain: number, pan: number, decay: number) {
    if (!ctx) return;

    // Transient, up where small speakers actually reproduce. This is what makes
    // the knock audible at all; it is far too short to ring.
    const tr = noiseSrc();
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 900;
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0, t);
    tg.gain.linearRampToValueAtTime(gain * 0.55, t + 0.001);
    tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.022);
    tr.connect(hp);
    hp.connect(tg);
    route(tg, pan, 0.25);
    tr.start(t);
    tr.stop(t + 0.04);

    // Body. Wide, not resonant — a high Q here rings like struck metal.
    const s = noiseSrc();
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = freq;
    bp.Q.value = 1.6;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(freq * 4.5, t);
    lp.frequency.exponentialRampToValueAtTime(freq * 1.4, t + decay);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    s.connect(bp);
    bp.connect(lp);
    lp.connect(g);
    route(g, pan, 0.34);
    s.start(t);
    s.stop(t + decay + 0.02);

    // Pitch. Triangle, not square: a square's odd harmonics are what made this
    // sound like a machine rather than like timber.
    const o = ctx.createOscillator();
    const og = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(freq * 0.78, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.62, t + decay * 0.8);
    og.gain.setValueAtTime(0, t);
    og.gain.linearRampToValueAtTime(gain * 0.55, t + 0.004);
    og.gain.exponentialRampToValueAtTime(0.0001, t + decay * 0.85);
    o.connect(og);
    route(og, pan, 0.22);
    o.start(t);
    o.stop(t + decay + 0.01);
  }

  /**
   * Scaffolding running up: a burst of clicks alternating between two pitches —
   * the "cu-ku" of a ratchet — drifting down and ending on one longer, lower
   * click for the tail.
   */
  function ratchet({ count = 6, rate = 0.13, freq = 560, gain = 0.8, pan = 0 }: ClickOpts) {
    const t0 = now() + 0.01;
    for (let i = 0; i < count; i++) {
      const last = i === count - 1;
      // Humanised spacing; dead-even clicks sound like a machine gun.
      const t = t0 + i * rate * (0.93 + Math.random() * 0.14);
      const two = i % 2 ? 1.24 : 1.0;
      const drift = 1 - (i / Math.max(1, count - 1)) * 0.1;
      click(
        t,
        freq * two * drift * (last ? 0.82 : 1),
        gain * (0.75 + Math.random() * 0.5) * (last ? 1.25 : 1),
        pan,
        last ? 0.3 : 0.105 + Math.random() * 0.04
      );
    }
  }

  /** Filtered noise swell — the room opening as the site is set out. */
  function air(from: number, to: number, dur: number, gain: number) {
    if (!ctx) return;
    const t = now();
    const s = noiseSrc();
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 0.8;
    bp.frequency.setValueAtTime(from, t);
    bp.frequency.exponentialRampToValueAtTime(Math.max(40, to), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(bp);
    bp.connect(g);
    route(g, 0, 0.9);
    s.start(t);
    s.stop(t + dur + 0.1);
  }

  /**
   * The mark landing. Kept under ~70Hz deliberately: any higher and it starts
   * to read as a note, which is the chime this exists to avoid.
   */
  function sub(freq: number, gain: number, dur: number) {
    if (!ctx) return;
    const t = now();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(freq * 1.3, t);
    o.frequency.exponentialRampToValueAtTime(freq, t + dur * 0.5);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    route(g, 0, 0.4);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function makeBed() {
    if (bed || !ctx) return;
    const t = now();
    bed = ctx.createGain();
    bed.gain.value = 0.0001;
    bedFilter = ctx.createBiquadFilter();
    bedFilter.type = "lowpass";
    bedFilter.frequency.value = 340;
    bedFilter.Q.value = 0.7;

    // A low triad, not one tone — the warmth is in the interval.
    [87.31, 130.81, 174.61].forEach((f, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = "sine";
      o.frequency.value = f;
      const lfo = ctx!.createOscillator();
      const lg = ctx!.createGain();
      lfo.frequency.value = 0.05 + i * 0.017;
      lg.gain.value = 0.9;
      lfo.connect(lg);
      lg.connect(o.detune);
      lfo.start(t);
      g.gain.value = [0.5, 0.3, 0.16][i];
      o.connect(g);
      g.connect(bedFilter!);
      o.start(t);
    });

    const s = noiseSrc();
    const nlp = ctx.createBiquadFilter();
    nlp.type = "lowpass";
    nlp.frequency.value = 190;
    const ng = ctx.createGain();
    ng.gain.value = 0.35;
    s.connect(nlp);
    nlp.connect(ng);
    ng.connect(bedFilter);
    s.start(t);

    bedFilter.connect(bed);
    bed.connect(master!);
    const send = ctx.createGain();
    send.gain.value = 0.5;
    bed.connect(send);
    send.connect(verb!);
  }

  return {
    async unlock() {
      ensure();
      if (!ctx || !master) return false;
      if (ctx.state === "suspended") await ctx.resume();
      enabled = true;
      master.gain.cancelScheduledValues(now());
      master.gain.exponentialRampToValueAtTime(2.6, now() + 0.3);
      return ctx.state === "running";
    },
    mute() {
      enabled = false;
      if (!ctx || !master) return;
      master.gain.cancelScheduledValues(now());
      master.gain.exponentialRampToValueAtTime(0.0001, now() + 0.25);
    },
    get running() {
      return live();
    },
    bedLevel(level, ramp = 1.4) {
      if (!ctx) return;
      makeBed();
      if (!bed) return;
      bed.gain.cancelScheduledValues(now());
      bed.gain.exponentialRampToValueAtTime(Math.max(0.0001, level * 1.5), now() + ramp);
      bedFilter?.frequency.cancelScheduledValues(now());
      bedFilter?.frequency.linearRampToValueAtTime(240 + level * 900, now() + ramp);
    },
    draw() {
      if (!live()) return;
      air(340, 1300, 1.3, 0.55);
    },
    scaffold(busy, pan) {
      if (!live()) return;
      ratchet({
        count: 4 + Math.round(Math.random() * 2 + busy * 2),
        rate: 0.142 - busy * 0.026,
        freq: 430 + Math.random() * 330,
        gain: 0.74 + Math.random() * 0.22,
        pan,
      });
    },
    burstGap(activity) {
      // Bursts must be spaced further apart than a burst is long (~6 clicks at
      // ~130ms) or the runs pile up into a continuous rattle.
      const g = 1.85 + (1.15 - 1.85) * activity;
      return g * (0.7 + Math.random() * 0.7);
    },
    mark() {
      if (!live()) return;
      sub(62, 0.55, 3.2);
      air(220, 1050, 2.4, 0.3);
    },
    close() {
      this.bedLevel(0.0001, 1.4);
    },
  };
}
