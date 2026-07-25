import express from 'express';
import cors from 'cors';
import ytDlp from 'yt-dlp-exec';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/convert', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'La URL es requerida' });
    }

    try {
        console.log('Iniciando conversión y descarga para:', url);
        const outputFilename = `audio-${Date.now()}.mp3`;
        const outputPath     = path.join(process.cwd(), outputFilename);

        await ytDlp(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: outputPath,
            ffmpegLocation: ffmpegPath,
            noPlaylist: true,
        });

        console.log('Conversion completada con exito!');
        res.json({
            message: 'Conversion exitosa',
            file: outputFilename
        });
    } catch (error) {
        console.error('Error durante la conversion:', error);
        res.status(500).json({ error: 'Fallo al procesar el video' });
    }
});

// Servidor en escucha en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});