const connect = require("../db");
const { getUserFromToken } = require("./usersController");
const fs = require("fs").promises;
const path = require("path");

const index = async (req, res) => {
    const user = getUserFromToken(req.headers["token"]);
    const spaceId = req.params.id
    const conn = await connect();

    const [result] = await conn.query(
        "SELECT * FROM cards WHERE spaceId = ?",
        [spaceId]
    );

    return res.json({
        data: result,
    });
}


const store = async (req, res) => {
    // const user = getUserFromToken(req.headers["token"]);
    const spaceId = req.params.id
    const conn = await connect();
    const { title,  description, canvasImg, cardColor } = req.body
    const file = req.files?.file ?? ''
    const timestamp = Date.now();

    let filePath = ''

    if(file) filePath = `${__dirname}/../uploads/${timestamp}_${file.name}`;

    if(file) await file.mv(filePath)

    const [result] = await conn.query('INSERT INTO cards (title, description, file, canvasImg, cardColor, spaceId) VALUES (?, ?, ?, ?, ?, ?)', [title, description, filePath, canvasImg, cardColor, spaceId]);
    const [newSpace] = await conn.query('SELECT * FROM cards WHERE id = ?', [result.insertId]);

    res.json({
        data: newSpace[0]
    })
}

const card = async (req, res) => {
    const cardId = req.params.id
    const conn = await connect();
console.log(`Card ${cardId}`)
    const [result] = await conn.query(
        "SELECT * FROM cards WHERE id = ?",
        [cardId]
    );

    return res.json({
        data: result,
    });

}
const deleteCard = async (req, res) => {
    const cardId = req.params.id
    const conn = await connect();
console.log(`Card ${cardId}`)
    const [result] = await conn.query(
        "DELETE FROM cards WHERE id = ?",
        [cardId]
    );

    return res.json({
        data: result,
    });

}

const cardFile = async (req, res) => {
    const cardId = req.params.id;
    const conn = await connect();

    const [result] = await conn.query(
        "SELECT file FROM cards WHERE id = ?",
        [cardId]
    );

    if (result.length > 0) {
        const relativeFilePath = result[0].file;
        const absoluteFilePath = path.resolve(__dirname, '../uploads/', relativeFilePath);
        res.sendFile(absoluteFilePath);
    } else {
        res.status(404).json({ message: 'File not found' });
    }
};



module.exports = {
    index,
    store,
    card,
    cardFile,
    deleteCard
}
