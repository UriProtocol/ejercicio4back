const connect = require("../db");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const { nombre, password } = req.body;

  const conn = await connect();
  try {
    const [result] = await conn.query(
      "SELECT * FROM users WHERE name = ? AND password = ?",
      [nombre, password]
    );

    if (result.length > 0) {
      const token = jwt.sign(
        {
          id: result[0].id,
          name: result[0].name,
          rol: result[0].rol,
        },
        "secret123",
        {
          expiresIn: "365d",
        }
      );

      const userData = getUserFromToken(token);
      console.log(userData);

      return res.json({
        result: result,
        token: token,
      });
    } else {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }
  } catch (error) {
    console.error("Error al realizar la consulta:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};



const getUserFromToken = (token) => {
  try {
    const decodedToken = jwt.verify(token, "secret123");
    const {
      id,
      name,
      rol,
    } = decodedToken;
    return {
      id,
      name,
      rol,
    };
  } catch (error) {
    console.error("Error al verificar el token:", error);
    return null;
  }
};

const me = (req, res) => {
  const token = req.headers["baerer"];
  try {
    const decodedToken = jwt.verify(token, "secret123");
    const {
      id,
      name,
      rol,
    } = decodedToken;

    return res.json({
      id,
      name,
      rol,
    });
  } catch (error) {
    console.error("Error al verificar el token:", error);
    return null;
  }
};


const verifyJWT = (req, res, next) => {
  const token = req.headers["token"];
  if (!token) {
    res.status(403).send({
      mensaje: "No se encontro el token",
    });
  } else {
    jwt.verify(token, "secret123", (err, decoded) => {
      if (err) {
        res.status(402).send({
          mensaje: "Fallo la autenticación del token",
          error: err,
        });
      } else {
        next();
      }
    });
  }
};

module.exports = {
  login,
  getUserFromToken,
  verifyJWT,
  me,
};
