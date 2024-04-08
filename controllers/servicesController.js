import Services from '../models/Services.js'
import { validateObjectId, handleNotFoundError } from '../utils/index.js'
import fs from 'fs'
import path from 'path'

const createService = async (req, res) => {
    if (Object.values(req.body).includes('')) {
        const error = new Error('Todos los campos son obligatorios')
        return res.status(400).json({ msg: error.message })
    }
    const userIdentity = req.user.admin
    if (userIdentity === false) {
        return res.status(404).send({
            msg: "No tienes los permisos"
        })
    }
    try {
        const service = new Services(req.body)
        await service.save()
        res.json({
            msg: 'El servicio se creo correctamente',
            // userIdentity
            services: service,
            status: "success"
        })
    } catch (error) {
        console.log(error)
    }
}

const getServices = async (req, res) => {
    try {
        const services = await Services.find()
        res.json(services)
    } catch (error) {
        console.log(error)
    }
}

const getServiceById = async (req, res) => {
    const { id } = req.params
    // validar un object Id
    if (validateObjectId(id, res)) return
    const userIdentity = req.user.admin
    if (userIdentity === false) {
        return res.status(404).send({
            msg: "No tienes los permisos"
        })
    }
    // Validar que exista
    const service = await Services.findById(id)

    if (!service) {
        return handleNotFoundError('El servicio no existe', res)
    }
    // Mostrar el servicio
    res.json(service)
}

const updateService = async (req, res) => {
    const { id } = req.params
    // validar un object Id
    if (validateObjectId(id, res)) return
    const userIdentity = req.user.admin
    if (userIdentity === false) {
        return res.status(404).send({
            msg: "No tienes los permisos"
        })
    }
    // Validar que exista
    const service = await Services.findById(id)

    if (!service) {
        return handleNotFoundError('El servicio no existe', res)
    }

    // Escribimos en el objeto los valores nuevos
    service.name = req.body.name || service.name
    service.price = req.body.price || service.price
    try {
        await service.save()
        res.json({
            msg: 'El servicio se actualizo correctamente',
            service: service
        })
    } catch (error) {
        console.log(error)
    }
}

const deleteService = async (req, res) => {
    const { id } = req.params
    // validar un object Id
    if (validateObjectId(id, res)) return

    const userIdentity = req.user.admin
    if (userIdentity === false) {
        return res.status(404).send({
            msg: "No tienes los permisos"
        })
    }

    // Validar que exista
    const service = await Services.findById(id)

    if (!service) {
        return handleNotFoundError('El servicio no existe', res)
    }
    try {
        await service.deleteOne()
        res.json({
            msg: 'El servicio se eliminó correctamente'
        })
    } catch (error) {
        console.log(error)
    }
}
const uploadImagem = async (req, res) => {
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "Petición no incluye una imagen"
        })
    }
    let image = req.file.originalname
    // Sacar el nombre del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    if (extension != "png" && extension != "jpg" && extension != "jpg" && extension != "gif") {
        // Si no es correcto, borrar archivo
        const filePath = req.file.path;
        const fileDelete = fs.unlinkSync(filePath);
        // Devolver respuesta negativa
        return res.status(400).send({
            status: "error",
            message: "La extension del fichero invalida"
        })
    }
    const userIdentity = req.user.admin
    if (userIdentity === false) {
        return res.status(404).send({
            msg: "No tienes los permisos"
        })
    }
    try {
        const service = await Services.findById(req.params.id);
        if (!service) {
            return res.status(404).send({
                status: "error",
                message: "servicio no encontrado"
            });
        }

        // Actualizar el campo de imagen del usuario
        service.image = req.file.filename;
        const serviceUpdate = await service.save();

        // Devolver respuesta exitosa
        return res.status(200).send({
            status: "success",
            service: serviceUpdate,
            file: req.file
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al subir la imagen",
            error: error.message
        });
    }
}

const getImageService = (req, res) => {
    // Sacar el parametro url
    const file = req.params.file;

    // Montar el path real de la imagen 
    const filePath = "./storage/services/" + file;

    // Comprobar que existe
    fs.stat(filePath, (error, exists) => {
        if (!exists) {
            return res.status(404).send({
                status: "error",
                message: "No existe la imagen"
            })
        }
        // Devolver un file
        return res.status(500).sendFile(path.resolve(filePath));
    });

}





export {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService,
    uploadImagem,
    getImageService
}