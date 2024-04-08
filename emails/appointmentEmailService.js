import { createTransport } from '../config/nodemailer.js'


export async function sendEmailNewAppointment({ date, time }) {
    const transporter = createTransport(
        process.env.EMAIL_HOST,
        process.env.EMAIL_PORT,
        process.env.EMAIL_USER,
        process.env.EMAIL_PASS
    )

    const info = await transporter.sendMail({
        from: 'Salon de Belleza ! <citasturbo@gmail.com>',
        to: 'YCJ@gmail.com',
        subject: "SalonBelleza",
        text: "Salon - Nueva Cita",
        html: `<p>Hola: Supremo tienes una nueva Cita </p>
        <p>La cita sera el día: ${date} a las ${time} horas</p>
        `
    })
}


export async function sendEmailUpdateAppointment({ date, time }) {
    const transporter = createTransport(
        process.env.EMAIL_HOST,
        process.env.EMAIL_PORT,
        process.env.EMAIL_USER,
        process.env.EMAIL_PASS
    )

    const info = await transporter.sendMail({
        from: 'Salon de Belleza ! <citasturbo@gmail.com>',
        to: 'YCJ@gmail.com',
        subject: "SalonBelleza - Cita Actualizada",
        text: "Salon - Cita Actualizada",
        html: `<p>Hola: Supremo, un usaurio ha modificado una cita </p>
        <p>La nueva cita sera el día: ${date} a las ${time} horas</p>
        `
    })
}

export async function sendEmailDeleteAppointment({ date, time }) {
    const transporter = createTransport(
        process.env.EMAIL_HOST,
        process.env.EMAIL_PORT,
        process.env.EMAIL_USER,
        process.env.EMAIL_PASS
    )

    const info = await transporter.sendMail({
        from: 'Salon de Belleza ! <citasturbo@gmail.com>',
        to: 'YCJ@gmail.com',
        subject: "SalonBelleza -  Cita Cancelada",
        text: "Salon - Cita Cancelada",
        html: `<p>Hola: Supremo, un usaurio ha cancelado una cita </p>
        <p>La cita fue cancelada el  día: ${date} a las ${time} horas</p>
        `
    })
}