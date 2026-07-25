import express from 'express';
import cors from 'cors';
import ytDlp from 'yt-dlp-exec';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

app.post('/api/convert', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'La URL es requerida' });
    }

    try {
        console.log('Obteniendo informacion del video...');

        const videoInfo = await ytDlp(url, {
            dumpSingleJson: true,
            noPlaylist: true,
        });

        const title = videoInfo.title || 'audio';
        const thumbnail = videoInfo.thumbnail || '';
        const outputFilename = `${Date.now()}.mp3`;
        const outputPath     = path.join(tempDir, outputFilename);

        console.log(`Iniciando la conversion y descarga para ${title}...`);
        await ytDlp(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: outputPath,
            ffmpegLocation: ffmpegPath,
            noPlaylist: true,
        });

        setTimeout(() => {                          // timeout de 10 min, si nadie ha descargado el archivo se borra solo de la carpeta /temp
            if (fs.existsSync(outputPath)) {
                fs.unlink(outputPath, (err) => {
                    if (!err) console.log(`Archivo expirado eliminado: ${outputFilename}`);
                });
            }
        }, 10 * 60 * 1000);

        console.log('Conversion completada con exito!');
        res.json({
            message: 'Conversion exitosa',
            title: title,
            thumbnail: thumbnail,
            downloadUrl: `http://localhost:3000/api/download/${outputFilename}?title=${encodeURIComponent(title)}` 
        });
    } catch (error) {
        console.error('Error durante la conversion:', error);
        res.status(500).json({ error: 'Fallo al procesar el video de Youtube' });
    }
});

app.get('/api/download/:filename', (req, res) => {
    const { filename } = req.params;
    const customTitle = req.query.title ? `${req.query.title}.mp3` : filename;
    const filePath = path.join(tempDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'El archivo no existe' });
    }

    res.download(filePath, customTitle, (err) => {
        if (err) {
            console.error('Error enviando el archivo:', err);
        } else {
            console.log(`Archivo ${filename} descargado con éxito por el usuario.`);
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error('Error eliminando archivo temporal:', unlinkErr);
            });
        }
    })
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});