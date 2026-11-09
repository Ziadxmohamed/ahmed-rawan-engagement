/** Original instrumental, synthesized locally. No recordings or third-party music. */
export class InvitationAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private timer?: ReturnType<typeof setInterval>;
  private step = 0;
  async play() {
    this.context ??= new AudioContext();
    await this.context.resume();
    this.master ??= this.context.createGain();
    this.master.gain.setValueAtTime(0.22, this.context.currentTime);
    this.master.connect(this.context.destination);
    if (this.timer) return;
    const chords = [
      [57, 60, 64, 69],
      [53, 57, 60, 65],
      [48, 55, 60, 64],
      [55, 59, 62, 67],
    ];
    const note = () => {
      const ctx = this.context!,
        now = ctx.currentTime,
        chord = chords[Math.floor(this.step / 8) % 4];
      const midi = chord[this.step % 4] + (this.step % 8 >= 4 ? 12 : 0),
        freq = 440 * Math.pow(2, (midi - 69) / 12);
      const osc = ctx.createOscillator(),
        gain = ctx.createGain(),
        filter = ctx.createBiquadFilter();
      osc.type = "triangle";
      osc.frequency.value = freq;
      filter.type = "lowpass";
      filter.frequency.value = 1700;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.6);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.master!);
      osc.start(now);
      osc.stop(now + 2.7);
      osc.onended = () => {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
      this.step++;
    };
    note();
    this.timer = setInterval(note, 510);
  }
  pause() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    if (this.context && this.master)
      this.master.gain.setTargetAtTime(0, this.context.currentTime, 0.15);
  }
  chime() {
    if (!this.context || !this.master || !this.timer) return;
    const ctx = this.context,
      now = ctx.currentTime;
    [880, 1108, 1320].forEach((frequency, i) => {
      const osc = ctx.createOscillator(),
        gain = ctx.createGain();
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.08, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
      osc.connect(gain);
      gain.connect(this.master!);
      osc.start(now + i * 0.1);
      osc.stop(now + 1);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  }
  dispose() {
    this.pause();
    void this.context?.close();
  }
}
