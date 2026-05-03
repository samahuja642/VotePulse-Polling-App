async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function getWebGLSignal() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'no-webgl';
  } catch {
    return 'no-webgl';
  }
}

export async function getDeviceHash() {
  const signals = [
    navigator.platform,
    String(navigator.hardwareConcurrency || 'unknown'),
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    getWebGLSignal(),
  ];
  return sha256(signals.join('|'));
}
