(function () {
  const SFX_PATTERNS = {
    shoot: [[150, 0.04, 'sawtooth', 0.05], [80, 0.07, 'square', 0.03]],
    shotgun: [[95, 0.08, 'sawtooth', 0.07], [180, 0.04, 'square', 0.04]],
    pickup: [[740, 0.06, 'triangle', 0.04], [980, 0.08, 'triangle', 0.03]],
    key: [[520, 0.08, 'triangle', 0.05], [1040, 0.1, 'triangle', 0.04]],
    door: [[220, 0.12, 'sawtooth', 0.04], [330, 0.08, 'triangle', 0.03]],
    error: [[110, 0.12, 'square', 0.05]],
    success: [[660, 0.08, 'triangle', 0.04], [880, 0.08, 'triangle', 0.04], [1320, 0.12, 'triangle', 0.04]],
    damage: [[55, 0.12, 'sawtooth', 0.06]],
    enemyDown: [[180, 0.06, 'square', 0.04], [90, 0.1, 'sawtooth', 0.04]]
  };

  function createRuntimeAudioController({
    bgmUrl,
    volume = 0.45
  }) {
    let audioContext = null;

    const bgm = new Audio(bgmUrl);
    bgm.loop = true;
    bgm.preload = 'auto';
    bgm.volume = volume;

    function ensureAudio() {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContext.state === 'suspended') audioContext.resume();
    }

    function playTone(freq, duration = 0.08, type = 'square', gain = 0.04) {
      if (!audioContext) return;
      const osc = audioContext.createOscillator();
      const amp = audioContext.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      amp.gain.setValueAtTime(gain, audioContext.currentTime);
      amp.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      osc.connect(amp).connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + duration);
    }

    function playSfx(name) {
      ensureAudio();
      for (const args of SFX_PATTERNS[name] || []) playTone(...args);
    }

    function startBgm() {
      ensureAudio();
      const playPromise = bgm.play();

      if (!playPromise || typeof playPromise.then !== 'function') {
        return;
      }

      playPromise.then(() => {
        document.removeEventListener('pointerdown', startBgm);
        window.removeEventListener('touchstart', startBgm);
        window.removeEventListener('keydown', startBgm);
      }).catch(() => {});
    }

    function getAudioState() {
      return {
        hasContext: Boolean(audioContext),
        bgmLoop: bgm.loop === true,
        bgmPreload: bgm.preload,
        bgmVolume: bgm.volume,
        sfxCount: Object.keys(SFX_PATTERNS).length
      };
    }

    return {
      getAudioState,
      playSfx,
      startBgm
    };
  }

  window.ASCII_LABYRINTH_RUNTIME_AUDIO = {
    createRuntimeAudioController
  };
})();
