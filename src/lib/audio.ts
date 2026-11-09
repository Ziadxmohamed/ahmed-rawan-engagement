/** Original 54-second piano and strings miniature, composed in scripts/compose_music.py.
 * No recordings, samples or third-party melody. The file is fetched only after interaction. */
export class InvitationAudio {
  private player?: HTMLAudioElement;
  private context?: AudioContext;
  async play() {
    this.player ??= new Audio("/music/our-next-chapter.m4a");
    this.player.loop = true;
    this.player.volume = 0.42;
    this.player.preload = "none";
    try {
      this.context ??= new AudioContext();
      void this.context.resume();
    } catch {
      /* The recorded original still works without Web Audio. */
    }
    await this.player.play();
  }
  pause() {
    this.player?.pause();
  }
  chime() {
    if (
      !this.context ||
      this.context.state !== "running" ||
      !this.player ||
      this.player.paused
    )
      return;
    const ctx = this.context,
      now = ctx.currentTime;
    [1046.5, 1318.51, 1567.98].forEach((frequency, i) => {
      const oscillator = ctx.createOscillator(),
        gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.018, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now + i * 0.1);
      oscillator.stop(now + 1.15);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    });
  }
  dispose() {
    this.pause();
    if (this.player) {
      this.player.removeAttribute("src");
      this.player.load();
    }
    void this.context?.close();
  }
}
