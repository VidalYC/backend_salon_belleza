import Appointment from "../models/Appointment.js";
import { parse, formatISO, startOfDay, endOfDay, isValid } from "date-fns";
import moment from "moment";
import {
  validateObjectId,
  handleNotFoundError,
  formatDate,
  formatearFecha,
} from "../utils/index.js";
import {
  sendEmailNewAppointment,
  sendEmailUpdateAppointment,
  sendEmailDeleteAppointment,
} from "../emails/appointmentEmailService.js";

const createAppointment = async (req, res) => {
  const appointment = req.body;
  appointment.user = req.user._id.toString();
  console.log(appointment);
  try {
    const newAppointment = new Appointment(appointment);
    const result = await newAppointment.save();

    await sendEmailNewAppointment({
      date: formatDate(result.date),
      time: result.time,
    });
    res.json({
      msg: "Tu reserva se realizo correctamente",
      status: "success",
    });
  } catch (error) {
    res.status(404).json({
      msg: "Ocurrio un error al crear el servicio",
      status: "error",
    });
  }
};

const getAppointmentsByDate = async (req, res) => {
  const { date } = req.query;

  const isoDate = moment.utc(date, "DD/MM/YYYY").format();

  const appointments = await Appointment.find({
    date: {
      $gte: startOfDay(new Date(isoDate)),
      $lte: endOfDay(new Date(isoDate)),
    },
  }).select("time");

  res.json(appointments);
};

const getAppointmentById = async (req, res) => {
  const { id } = req.params;

  // Validar por objectId
  if (validateObjectId(id, res)) return;

  // Validar que exista
  const appointment = await Appointment.findById(id).populate("services");
  if (!appointment) {
    return handleNotFoundError("La Cita no existe", res);
  }

  if (appointment.user.toString() !== req.user._id.toString()) {
    const error = new Error("No tiene los permisos");
    return res.status(403).json({ msg: error.message });
  }

  // Retornar la cita
  res.json(appointment);
};

const updateAppointment = async (req, res) => {
  const { id } = req.params;

  // Validar por objectId
  if (validateObjectId(id, res)) return;

  // Validar que exista
  const appointment = await Appointment.findById(id).populate("services");
  if (!appointment) {
    return handleNotFoundError("La Cita no existe", res);
  }

  if (appointment.user.toString() !== req.user._id.toString()) {
    const error = new Error("No tiene los permisos");
    return res.status(403).json({ msg: error.message });
  }

  const { date, time, totalAmount, services } = req.body;
  appointment.date = date;
  appointment.time = time;
  appointment.totalAmount = totalAmount;
  appointment.services = services;

  try {
    const result = await appointment.save();
    await sendEmailUpdateAppointment({
      date: formatearFecha(result.date),
      time: result.time,
    });
    res.json({
      msg: "cita actualizada correctamente",
      status: "success",
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteAppointment = async (req, res) => {
  const { id } = req.params;

  if (validateObjectId(id, res)) return;

  const appointment = await Appointment.findById(id).populate("services");
  if (!appointment) {
    return handleNotFoundError("La Cita no existe", res);
  }

  try {
    if (req.user.admin === true) {
      const result = await appointment.deleteOne();
      res.json({ msg: "Cita cancelada correctamente", status: "success" });

      await sendEmailDeleteAppointment({
        date: appointment.date,
        time: appointment.time,
      });
    } else {
      if (appointment.user.toString() !== req.user._id.toString()) {
        const error = new Error("No tiene los permisos");
        return res.status(403).json({ msg: error.message });
      }
      const result = await appointment.deleteOne();
      res.json({ msg: "Cita cancelada correctamente", status: "success" });
      await sendEmailDeleteAppointment({
        date: appointment.date,
        time: appointment.time,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export {
  createAppointment,
  getAppointmentsByDate,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};
