import { createTransport } from '../config/nodemailer.js'

export async function sendEmailVerification({ name, email, token }) {
    const transporter = createTransport(
        process.env.EMAIL_HOST,
        process.env.EMAIL_PORT,
        process.env.EMAIL_USER,
        process.env.EMAIL_PASS
    )

    // Enviar email
    const info = await transporter.sendMail({
        from: 'Consultorio del Dr. Juan Velázquez ! <salonTurbo@gmail.com>',
        to: email,
        subject: "SalonBelleza",
        text: "Salon - Confirmar Cuenta",
        html: `<p>Hola: ${name}, confirma tu cuenta en Consultorio del Dr. Juan Velázquez </p>
        <p>Tu cuenta esta casi lista, solo debes confirmar en el siguiente enlace</p>
        <a href="${process.env.FRONTEND_URL}/verify/${token}">Confirmar Cuenta</a>
        <p>Si tu no creaste esta cuenta, puede omitir este mensaje</p>
        `
    })

    console.log('Mensaje enviado', info.messageId)

}


export async function sendEmailPasswordReset({ name, email, token }) {
    const transporter = createTransport(
        process.env.EMAIL_HOST,
        process.env.EMAIL_PORT,
        process.env.EMAIL_USER,
        process.env.EMAIL_PASS
    )

    // Enviar email
    const info = await transporter.sendMail({
        from: 'Consultorio del Dr. Juan Velázquez ! <salonTurbo@gmail.com>',
        to: email,
        subject: "SalonBelleza -  Restablece tu Passsword",
        text: "Salon - Restablece tu Passsword",
        html: `<p>Hola: ${name}, Has solicitado restablecer tu Password </p>
        <p>sigue el siguiente enlace para generar un nuevo password: </p>
        <a href="${process.env.FRONTEND_URL}/forgot-password/${token}">Restablecer Password</a>
        <p>Si tu no soliciatste esto, puedes omitir este mensaje</p>
        `
    })

    console.log('Mensaje enviado', info.messageId)

}
