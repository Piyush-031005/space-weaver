// Lazy-loaded reference so we only import once
let _app = null;
let _err = null;

export default async function handler(req, res) {
  // First request: try to load Express app
  if (!_app && !_err) {
    try {
      const mod = await import('../server/index.js');
      _app = mod.default;
    } catch (e) {
      _err = e;
    }
  }

  // If import failed, return the full error as readable JSON (not a crash)
  if (_err) {
    return res.status(500).json({
      vercel_init_error: true,
      name: _err.name,
      message: _err.message,
      // Show first 5 lines of stack so we can see which file caused it
      stack: (_err.stack || '').split('\n').slice(0, 8).join('\n'),
    });
  }

  return _app(req, res);
}
