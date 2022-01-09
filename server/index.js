const fastify = require('fastify').default;
const fastify_session = require('@fastify/session');
const fastify_cookie = require('fastify-cookie');
const fastify_static = require('fastify-static');
const path = require('path');

const app = fastify({ logger: true });

const html = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link href="/dist/esbuild/esbuild.css" rel="stylesheet">
      <link href="/dist/postcss/postcss.css" rel="stylesheet">
      <script src="https://code.iconify.design/2/2.1.0/iconify.min.js"></script>
  </head>
  <body>
      <div id="root"></div>
      <script src="/dist/esbuild/esbuild.js"></script>
  </body>  
  </html>
`;
// @ts-ignore
app.register(fastify_static, {
  root: path.join(process.cwd(), './client/dist'),
  prefix: '/dist/',
});
// @ts-ignore
app.get('/*', async (request, reply) => {
  return reply
    .status(200)
    .header('Content-Type', 'text/html')
    .send(html);
});


// @ts-ignore
app.register(fastify_cookie);

// @ts-ignore
app.register(fastify_session, {
  secret: 'a secret with minimum length of 32 characters',
  cookie: { secure: false },
});


process.nextTick(async () => {
  try {
    await app.listen(3000);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
});