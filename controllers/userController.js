import Appointment from "../models/Appointment.js"

const getUserAppointments = async (req, res) => {
    const { user } = req.params
    const isAdmin = req.user.admin;

    if (!isAdmin && user !== req.user._id.toString()) {
        const error = new Error('Acceso denegado')
        return res.status(400).json({ msg: error.message })
    }

    try {
        let query;
        if (isAdmin) {
            query = { date: { $gte: new Date() } };
        } else {
            query = { user, date: { $gte: new Date() } };
        }

        const appointments = await Appointment.find(query)
            .populate('services')
            .populate({ path: 'user', select: 'name email' })
            .sort({ date: 'asc' });

        res.json(appointments);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}

export {
    getUserAppointments
}
