import mongoose from "mongoose";

const servicesSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        default: "default.png"
    }

})

const Services = mongoose.model('Services', servicesSchema)
export default Services