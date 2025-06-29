const songsRouter = require('./api/songs');
const usersRouter = require('./api/users');
const reportsRouter = require('./api/reports');
const playlistsRouter = require('./api/playlists');

// ... existing middleware setup ...

app.use('/api/songs', songsRouter);
app.use('/api/users', usersRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/playlists', playlistsRouter);

// ... rest of the code ... 