import User from "../models/User.js";
import {
  sendEmailVerification,
  sendEmailPasswordReset,
} from "../emails/authEmailService.js";
import { generateJWT, uniqueId } from "../utils/index.js";
import fs from "fs";
import path from "path";
const register = async (req, res) => {
  // Valida todo los campos
  if (Object.values(req.body).includes("")) {
    const error = new Error("Todos los campos son obligatorios");
    return res.status(400).json({ msg: error.message });
  }

  const { email, password, name } = req.body;
  // Evitar registros duplicados
  const userExists = await User.findOne({ email });
  if (userExists) {
    const error = new Error("Usuario ya registrado");
    return res.status(400).json({ msg: error.message });
  }

  // validacion de extension nombre
  const MIN_NOMBRE_LENGHT = 3;
  const MAX_NOMBRE_LENGHT = 15;
  if (name.trim().length < MIN_NOMBRE_LENGHT) {
    const error = new Error(
      `El nombre debe contener minimo ${MIN_NOMBRE_LENGHT} caracteres`
    );
    return res.status(400).json({ msg: error.message });
  } else if (name.trim().length > MAX_NOMBRE_LENGHT) {
    const error = new Error(
      `El nombre debe contener maximo ${MAX_NOMBRE_LENGHT} caracteres`
    );
    return res.status(400).json({ msg: error.message });
  }

  // validacion extension del correo
  const MIN_EMAIL_LENGHT = 10;
  const MAX_EMAIL_LENGHT = 50;
  if (email.trim().length < MIN_EMAIL_LENGHT) {
    const error = new Error(
      `El email debe contener minimo ${MIN_EMAIL_LENGHT} caracteres`
    );
    return res.status(400).json({ msg: error.message });
  } else if (email.trim().length > MAX_EMAIL_LENGHT) {
    const error = new Error(
      `El email debe contener maximo ${MAX_EMAIL_LENGHT} caracteres`
    );
    return res.status(400).json({ msg: error.message });
  }

  // Validar la extension del password
  const MIN_PASSWORD_LENGHT = 8;
  const MAX_PASSWORD_LENGHT = 20;
  if (password.trim().length < MIN_PASSWORD_LENGHT) {
    const error = new Error(
      `El password debe contener ${MIN_PASSWORD_LENGHT} caracteres`
    );
    return res.status(400).json({ msg: error.message });
  } else if (password.trim().length > MAX_PASSWORD_LENGHT) {
    const error = new Error(
      `El password debe contener maximo ${MAX_PASSWORD_LENGHT} caracteres`
    );
    return res.status(400).json({ msg: error.message });
  }

  try {
    const user = new User(req.body);
    const result = await user.save();

    const { name, email, token } = result;
    sendEmailVerification({ name, email, token });

    res.json({
      msg: "El usuario se creo correctamente, revisa tu Email",
    });
  } catch (error) {
    console.log(error);
  }
};

const verifyAccount = async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({ token });
  if (!user) {
    const error = new Error("Hubo un error, token no valido");
    return res.status(401).json({ msg: error.message });
  }

  // Si el token es valido se confirma la cuenta
  try {
    user.verified = true;
    user.token = "";
    await user.save();
    res.json({ msg: "Usuario confirmado Correctamente" });
  } catch (error) {
    console.log(error);
  }
};

const login = async (req, res) => {
  // Valida todo los campos
  if (Object.values(req.body).includes("")) {
    const error = new Error("Todos los campos son obligatorios");
    return res.status(400).json({ msg: error.message });
  }
  const { email, password } = req.body;

  // Revisar que el usuario exista
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("El usuario no existe");
    return res.status(401).json({ msg: error.message });
  }
  // validacion extension del correo
  const MIN_EMAIL_LENGHT = 10;
  const MAX_EMAIL_LENGHT = 50;
  if (email.trim().length < MIN_EMAIL_LENGHT) {
    const error = new Error(
      `El email debe contener minimo ${MIN_EMAIL_LENGHT} caracteres`
    );
    return res.status(400).json({ msg: error.message });
  } else if (email.trim().length > MAX_EMAIL_LENGHT) {
    const error = new Error(
      `El email debe contener maximo ${MAX_EMAIL_LENGHT} caracteres`
    );
    return res.status(400).json({ msg: error.message });
  }

  // Validar la extension del password
  const MIN_PASSWORD_LENGHT = 6;
  const MAX_PASSWORD_LENGHT = 20;
  if (password.trim().length < MIN_PASSWORD_LENGHT) {
    const error = new Error(
      `El password debe contener ${MIN_PASSWORD_LENGHT} caracteres`
    );
    return res.status(400).json({ msg: error.message });
  } else if (password.trim().length > MAX_PASSWORD_LENGHT) {
    const error = new Error(
      `El password debe contener maximo ${MAX_PASSWORD_LENGHT} caracteres`
    );
    return res.status(400).json({ msg: error.message });
  }

  // Revisar si el usuario confirmo su cuenta
  if (!user.verified) {
    const error = new Error("Tu cuenta no ha sido confirmada aun");
    return res.status(401).json({ msg: error.message });
  }

  // Comprobar password
  if (await user.checkPassword(password)) {
    const token = generateJWT(user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      admin: user.admin,
      image: user.image,
      token,
    });
  } else {
    const error = new Error("El password es incorrecto");
    return res.status(401).json({ msg: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  // validacion extension del correo
  const MIN_EMAIL_LENGHT = 10;
  const MAX_EMAIL_LENGHT = 50;
  if (email.trim().length < MIN_EMAIL_LENGHT) {
    const error = new Error(
      `El email debe contener minimo ${MIN_EMAIL_LENGHT} caracteres`
    );
    return res.status(400).json({ msg: error.message });
  } else if (email.trim().length > MAX_EMAIL_LENGHT) {
    const error = new Error(
      `El email debe contener maximo ${MAX_EMAIL_LENGHT} caracteres`
    );
    return res.status(400).json({ msg: error.message });
  }

  // Comprobar si existe el usuario
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("El Usuario no existe");
    return res.status(404).json({ msg: error.message });
  }

  try {
    user.token = uniqueId();
    const result = await user.save();
    await sendEmailPasswordReset({
      name: result.name,
      email: result.email,
      token: result.token,
    });

    res.json({
      msg: "Hemos enviando un email con las intrucciones",
    });
  } catch (error) {
    console.log(error);
  }
};

const verifyPasswordResetToken = async (req, res) => {
  const { token } = req.params;
  const isValidToken = await User.findOne({ token });
  if (!isValidToken) {
    const error = new Error("Hubo un error, Token no valido");
    return res.status(400).json({ msg: error.message });
  }
  res.json({
    msg: "Token Valido",
  });
};

const updatePassword = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const user = await User.findOne({ token });
  if (!user) {
    const error = new Error("Hubo un error, Token no valido");
    return res.status(400).json({ msg: error.message });
  }
  try {
    const MIN_PASSWORD_LENGHT = 8;
    const MAX_PASSWORD_LENGHT = 20;
    if (password.trim().length < MIN_PASSWORD_LENGHT) {
      const error = new Error(
        `El password debe contener ${MIN_PASSWORD_LENGHT} caracteres`
      );
      return res.status(400).json({ msg: error.message });
    } else if (password.trim().length > MAX_PASSWORD_LENGHT) {
      const error = new Error(
        `El password debe contener maximo ${MAX_PASSWORD_LENGHT} caracteres`
      );
      return res.status(400).json({ msg: error.message });
    }

    user.token = "";
    user.password = password;
    await user.save();
    res.json({
      msg: "Password Modificado correctamente",
    });
  } catch (error) {
    console.log(error);
  }
};

const user = async (req, res) => {
  const { user } = req;
  res.json({
    user,
  });
};
const admin = async (req, res) => {
  const { user } = req;
  if (!user.admin) {
    const error = new Error("Acción No valida");
    return res.status(403).json({ msg: error.message });
  }
  res.json({
    user,
  });
};

const perfil = (req, res) => {
  const { user } = req;
  res.json(user);
};

const updatePerfil = async (req, res) => {
  const userIdentity = await User.findById(req.params.id);
  if (!userIdentity) {
    const error = new Error("Hubo un error");
    return res.status(400).json({ msg: error.message });
  }

  const { email } = req.body;
  if (userIdentity.email !== req.body.email) {
    const existeEmail = await User.findOne({ email });

    if (existeEmail) {
      const error = new Error("Ese email ya esta en uso");
      return res.status(400).json({ msg: error.message });
    }
  }

  try {
    userIdentity.name = req.body.name;
    userIdentity.email = req.body.email;

    const userupdate = await userIdentity.save();
    res.json({
      userupdate: userupdate,
      status: "success",
    });
  } catch (error) {
    console.log(error);
  }
};

const actualizarPassword = async (req, res) => {
  const { id } = req.user;
  const { pwd_actual, pwd_nuevo } = req.body;

  const user = await User.findById(id);
  if (!user) {
    const error = new Error("Hubo un error");
    return res.status(400).json({ msg: error.message });
  }

  if (await user.checkPassword(pwd_actual)) {
    // Almacenar el nuevo password

    user.password = pwd_nuevo;
    await user.save();
    res.json({ msg: "Password Almacenado Correctamente" });
  } else {
    const error = new Error("El Password Actual es Incorrecto");
    return res.status(400).json({ msg: error.message });
  }
};

const uploadImagenAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(404).send({
      status: "error",
      message: "Petición no incluye una imagen",
    });
  }
  let image = req.file.originalname;
  const imageSplit = image.split(".");
  const extension = imageSplit[1];

  if (
    extension != "png" &&
    extension != "jpg" &&
    extension != "jpg" &&
    extension != "gif"
  ) {
    const filePath = req.file.path;
    const fileDelete = fs.unlinkSync(filePath);
    return res.status(400).send({
      status: "error",
      message: "La extension del fichero invalida",
    });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({
        status: "error",
        message: "Usuario no existe",
      });
    }

    user.image = req.file.filename;
    const updateAvatar = await user.save();

    // Devolver respuesta exitosa
    return res.status(200).send({
      status: "success",
      service: updateAvatar,
      file: req.file,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al subir la imagen",
      error: error.message,
    });
  }
};
const getImageAvatar = (req, res) => {
  const file = req.params.file;

  const filePath = "./storage/avatar/" + file;

  fs.stat(filePath, (error, exists) => {
    if (!exists) {
      return res.status(404).send({
        status: "error",
        message: "No existe la imagen",
      });
    }
    // Devolver un file
    return res.status(500).sendFile(path.resolve(filePath));
  });
};

export {
  register,
  verifyAccount,
  login,
  forgotPassword,
  verifyPasswordResetToken,
  updatePassword,
  user,
  admin,
  perfil,
  updatePerfil,
  actualizarPassword,
  uploadImagenAvatar,
  getImageAvatar,
};
