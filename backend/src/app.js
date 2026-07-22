import express from 'express';
import dipendentiRoutes from './routes/dipendenti.routes.js';

const app = express();

app.use(express.json());
app.use('/api/dipendenti', dipendentiRoutes);
app.get('/api/ping', (req, res) => {
    res.json({ ok: true });
});


export default app;
