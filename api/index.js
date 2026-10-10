let handler;

try {
  // We use dynamic import to catch any initialization/import errors in the server tree
  const module = await import('../server/index.js');
  handler = module.default;
} catch (error) {
  handler = (req, res) => {
    res.status(500).json({
      error: "Failed to initialize server",
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  };
}

export default async function (req, res) {
  return handler(req, res);
}
