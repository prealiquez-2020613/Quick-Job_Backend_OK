import { Schema, model } from 'mongoose';

const userSchema = Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        maxLength: [25, `Can't be overcome 25 characters`],
    },
    surname: {
        type: String,
        required: [true, 'Surname is required'],
        maxLength: [25, `Can't be overcome 25 characters`],
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        lowercase: true,
        maxLength: [15, `Can't be overcome 15 characters`],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [8, 'Password must be 8 characters'],
        maxLength: [100, `Can't be overcome 100 characters`],
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        maxLength: [13, `Can't be overcome 8 numbers`],
        minLength: [8, 'Phone must be 8 numbers']
    },
    role: {
        type: String,
        enum: ['CLIENT', 'WORKER', 'ADMIN'],
        default: 'CLIENT'
    },
    location: {
        required: [true, 'Location is required'],
        type: String,
        enum: [
            'Alta Verapaz', 'Baja Verapaz', 'Chimaltenango', 'Chiquimula', 'Escuintla', 'Guatemala', 
            'Huehuetenango', 'Izabal', 'Jalapa', 'Jutiapa', 'Petén', 'Quetzaltenango', 'Quiché', 
            'Retalhuleu', 'Sacatepéquez', 'San Marcos', 'Santa Rosa', 'Sololá', 'Suchitepéquez', 
            'Totonicapán', 'Zacapa'
        ],
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
    },
    description: {
        type: String,
        maxLength: 500
    },
    experienceYears: {
        type: Number,
        default: 0
    },
    ratingAverage: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    userStatus: {
        type: Boolean,
        enum: [true, false]
    }
});

export default model('User', userSchema);
