import express from 'express';
import * as icons from './static/assets/icons.js';
const app = express();
const port = 3000;

// Serve static files
app.use(express.static('static'));

// Dynamic router for icons
const iconRoute = (req, res) => {
  const iconName = `${req.params.icon}Icon`;

  if (!icons[iconName]) {
    res.status(404).end();
  }

  const fill = req.params.fill || '000';

  const iconStr = icons[iconName].replace(
    /^<svg /,
    `<svg style="fill:#${fill};stroke:#${fill};" `
  );

  res.set('Content-Type', 'image/svg+xml');
  res.send(iconStr);
};

// Accept dynamic icon requests with or without a fill
app.get('/icons/:icon', iconRoute);
app.get('/icons/:icon/:fill', iconRoute);

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
