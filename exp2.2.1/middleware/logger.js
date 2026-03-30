const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function (data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    let statusColor;
    if (statusCode >= 500) statusColor = '\x1b[31m';
    else if (statusCode >= 400) statusColor = '\x1b[33m';
    else if (statusCode >= 300) statusColor = '\x1b[36m';
    else statusColor = '\x1b[32m';

    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} ` +
      `${statusColor}${statusCode}\x1b[0m (${duration}ms)`
    );

    return originalSend.call(this, data);
  };

  next();
};

const detailedLogger = (req, res, next) => {
  console.log('\n--- REQUEST DETAILS ---');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  if (Object.keys(req.body || {}).length > 0) {
    console.log('Body:', req.body);
  }
  console.log('---\n');

  next();
};

const performanceLogger = (slowThreshold = 100) => {
  return (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;

    res.send = function (data) {
      const duration = Date.now() - startTime;

      if (duration > slowThreshold) {
        console.warn(
          `⚠️  SLOW REQUEST: ${req.method} ${req.url} took ${duration}ms`
        );
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

module.exports = {
  requestLogger,
  detailedLogger,
  performanceLogger
};
