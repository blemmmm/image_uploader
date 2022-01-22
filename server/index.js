
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const fastify = require('fastify').default;
const fastify_session = require('@fastify/session');
const fastify_cookie = require('fastify-cookie');
const fastify_static = require('fastify-static');
const fastify_favicon = require('fastify-favicon');
const fastify_multipart = require('fastify-multipart');
const mime_types = require('mime-types');

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
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <title>ImageHippo - Free Image Upload</title>
      <meta name="title" content="ImageHippo - Free Image Upload">
      <meta name="description" content="With ImageHippo you can upload, get link, and share your images on websites, forums, blogs, and more!">
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

app.register(fastify_favicon, { path: './', name: 'favicon.ico' });

// @ts-ignore
app.get('/*', async (request, reply) => {
  return reply
    .status(200)
    .header('Content-Type', 'text/html')
    .send(html);
});


// @ts-ignore
app.register(fastify_cookie);
app.register(fastify_multipart);

// @ts-ignore
app.register(fastify_session, {
  secret: 'a secret with minimum length of 32 characters',
  cookie: { secure: false },
});

app.post('/upload', async function (request, reply) {
  const file = await request.file();
  const file_buffer = await file.toBuffer();
  const file_hash = crypto.createHash('sha224').update(file_buffer).digest('hex');
  const file_extname = path.extname(file.filename);
  const file_new_name = file_hash.concat(file_extname);
  fs.writeFileSync(path.join(process.cwd(), `./temp/${file_new_name}`), file_buffer);
  console.log('file new name', file_new_name);
  return reply.status(200).send({ 'filename': file_new_name });
});

app.get('/i/*', (request, reply) => {
  const url = request.url;
  const file_name = url.replace('/i/', '');
  const file_path = path.join(process.cwd(), `./temp/${file_name}`);
  if (fs.existsSync(file_path) === true) {
    // 200
    const file_buffer = fs.readFileSync(file_path);
    const content_type = mime_types.contentType(file_name);
    if (typeof content_type === 'string') {
      return reply.status(200)
        .header('Content-Type', content_type)
        .send(file_buffer);
    } else {
      return reply.status(500).send();
    }
  } else {
    // 404
    return reply.status(404).send();
  }
});

process.nextTick(async () => {
  try {
    await app.listen(3000);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
});