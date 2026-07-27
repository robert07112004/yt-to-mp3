import express from 'express';
import cors from 'cors';
import ytDlpDefault, { create as createYtDlp } from 'yt-dlp-exec'; // <-- Importación actualizada
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const tempDir = path.join(os.tmpdir(), 'yt-to-mp3-temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}
console.log('Carpeta temporal configurada en:', tempDir);

let safeFfmpegPath = ffmpegPath;
if (safeFfmpegPath.includes('app.asar')) {
    safeFfmpegPath = safeFfmpegPath.replace('app.asar', 'app.asar.unpacked');
}

let ytDlp = ytDlpDefault;
let ytdlpBinPath = path.join(__dirname, 'node_modules', 'yt-dlp-exec', 'bin', process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

if (ytdlpBinPath.includes('app.asar')) {
    ytdlpBinPath = ytdlpBinPath.replace('app.asar', 'app.asar.unpacked');
    if (fs.existsSync(ytdlpBinPath)) {
        ytDlp = createYtDlp(ytdlpBinPath);
    }
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
            ffmpegLocation: safeFfmpegPath,
            noPlaylist: true,
        });

        setTimeout(() => {
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
        const errorDetails = error.stack || error.message || JSON.stringify(error);
        const debugMsg = `URL: ${url}\n\nFFmpeg: ${safeFfmpegPath}\nYt-dlp: ${ytdlpBinPath}\n\nError Técnico:\n${errorDetails}`;
        
        try {
            const { dialog } = await import('electron');
            if (dialog) {
                dialog.showErrorBox('Fallo de Conversión (Debug Mode)', debugMsg);
            }
        } catch (dialogError) {
            const desktopPath = path.join(os.homedir(), 'Desktop', 'yt-mp3-error.txt');
            fs.writeFileSync(desktopPath, debugMsg);
        }

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

const possiblePaths = [
    path.resolve(__dirname, '../front/dist/front/browser'),
    path.resolve(__dirname, 'front/dist/front/browser'),
    path.resolve(__dirname, 'dist/front/browser'),
    process.resourcesPath ? path.join(process.resourcesPath, 'front/dist/front/browser') : ''
];

let frontDistPath = possiblePaths.find(p => p !== '' && fs.existsSync(p));
if (frontDistPath) {
    console.log('Interfaz encontrada en:', frontDistPath);
    app.use(express.static(frontDistPath));
    app.use((req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(frontDistPath, 'index.html'));
    });
} else {
    console.warn('No se encontró la interfaz gráfica.');
    app.use((req, res) => {
        res.status(404).send(`
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #d93025;">Error: No se encuentra el Frontend de Angular</h2>
                <p>El backend de Node funciona, pero no encuentra la carpeta compilada de Angular.</p>
                <h3>Rutas en las que se ha buscado:</h3>
                <ul>${possiblePaths.map(p => p ? `<li><code>${p}</code></li>` : '').join('')}</ul>
                <p><b>__dirname actual:</b> <code>${__dirname}</code></p>
            </div>
        `);
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});