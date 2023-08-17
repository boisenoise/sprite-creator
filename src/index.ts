import express, { Request, Response } from 'express';
import axios from 'axios';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const spritesPath = path.resolve(__dirname, 'sprites'); // Construct absolute path to 'sprites' directory
app.use('/sprites', express.static(spritesPath)); // Serve static files from "sprites" directory

app.post('/createSprite', async (req: Request, res: Response) => {
    const imageUrls: string[] = req.body.imageUrls;

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
        return res.status(400).send('Invalid image URLs');
    }

    const images = await Promise.all(imageUrls.map(url => axios.get(url, { responseType: 'arraybuffer' }).then(response => sharp(response.data))));
    const spriteHeight = Math.max(...await Promise.all(images.map(img => img.metadata().then(meta => meta.height!))));

    let spriteWidth = await images.reduce(async (width, img) => {
        const meta = await img.metadata();
        return (await width) + meta.width!;
    }, Promise.resolve(0));

    const sprite = sharp({
        create: {
            width: spriteWidth,
            height: spriteHeight,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
    });


    let offsets: number[] = [];

    await images.reduce(async (previousImageWidthPromise, img) => {
        const previousImageWidth = await previousImageWidthPromise;
        offsets.push(previousImageWidth);
        const meta = await img.metadata();
        return previousImageWidth + meta.width!;
    }, Promise.resolve(0));


    sprite.composite(await Promise.all(images.map(async (image, index) => {
        return await { input: await image.toBuffer(), gravity: 'northwest', left: offsets[index] || 0, top: 0 }
    })));

    let offsetCss = 0;
    let css = '';

    for (const image of images) {
        const meta = await image.metadata();
        css += `.sprite-${offsetCss} { background: url(sprite.png) -${offsetCss}px 0; width: ${meta.width}px; height: ${meta.height}px; }\n`;
        offsetCss += meta.width!;
    }

    const spriteFileName = `sprite-${Date.now()}.png`;
    const spriteFilePath = path.join(spritesPath, spriteFileName);
    if (!fs.existsSync(spritesPath)) {
        fs.mkdirSync(spritesPath);
    }
    // Save the sprite image to the file system
    await sprite.toFile(spriteFilePath);

    // Generate a URL for the sprite image
    const spriteUrl = `http://localhost:${port}/sprites/${spriteFileName}`;

    res.json({ spriteUrl, css });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
