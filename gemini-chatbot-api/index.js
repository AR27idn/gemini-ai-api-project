// import library yang diperlukan
import 'dotenv/config';
import express from 'express';
import cors from 'cors';   
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// memasukkan express ke variable app
const app = express();

// mengakses GoogleGenAI dengan API Key dari file .env
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY});

// memasukkan gemini 2.5 flash ke variable GEMINI_MODEL
const GEMINI_MODEL = 'gemini-2.5-flash';

// menggunakan library cors, karena akan kita akses express api dari frontend
app.use(cors());

// menggunakan express.json() karena akan kita hasilkan input dan output json
app.use(express.json());

// tambahan middleware untuk menangani serve file static froentend
app.use(express.static(path.join(__dirname, 'public')));

// memasukkan 3000 sebagai port nomor PORT
const PORT = 3000;

// ketika dijalankan, akan menulis di console: Server ready on...
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

function extractText(resp) {
    try {
        const text = 
            resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
            resp?.candidates?.[0]?.content?.parts?.[0]?.text ??
            resp?.response?.candidates?.[0]?.content?.text;

        return text ??  JSON.stringify(resp, null, 2);
    } catch (err) {
        console.log('Error extracting text:', err);
        return JSON.stringify(resp, null, 2);
    }
}

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        const contents = messages.map(msg => ({
            role: msg.role,
            parts: [{text: msg.content}]
        }));
        const resp = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents
        });
        res.json({ result: extractText(resp)});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});