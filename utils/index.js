import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { format } from "date-fns";
import es from "date-fns/locale/es/index.js";

function validateObjectId(id, res) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID no es valido");
    return res.status(400).json({ msg: error.message });
  }
}

function handleNotFoundError(message, res) {
  const error = new Error(message);
  return res.status(404).json({ msg: error.message });
}

const uniqueId = () =>
  Date.now().toString(32) + Math.random().toString(32).substring(2);

const generateJWT = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  return token;
};

function formatDate(date) {
  return format(date, "PPP", { locale: es });
}

const formatearFecha = (fecha) => {
  const nuevaFecha = new Date(fecha);

  const opciones = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return nuevaFecha.toLocaleDateString("es-ES", opciones);
};

export {
  validateObjectId,
  handleNotFoundError,
  uniqueId,
  generateJWT,
  formatDate,
  formatearFecha,
};
