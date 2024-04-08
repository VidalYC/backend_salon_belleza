import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import conectarDB from './config/db.js'
import servicesRoutes from './routes/servicesRoutes.js'
import authRoutes from './routes/authRoutes.js'
import appointmentsRoutes from './routes/appointmentRoutes.js'
import userRoutes from './routes/useRoutes.js'

const app = express()
app.use(express.json())
dotenv.config()
conectarDB()

const dominiosPermitidos = [process.env.FRONTEND_URL]
app.use(
    cors({
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    })
  );
// const corsOptions = {
//     origin: function (origin, callback) {
//         if (dominiosPermitidos.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             callback(new Error("No permitido por CORS"));
//         }
//     },
// };

// app.use(cors(corsOptions));

app.use('/api/services', servicesRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/appointments', appointmentsRoutes)
app.use('/api/users', userRoutes)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
})

