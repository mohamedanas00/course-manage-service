import { Schema, model } from "mongoose";

const courseSchema = new Schema({
    name: {
        type: String,
        required: true,
        lowercase: true
    },
    duration: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    capacity: {
        type: Number,
        required: true,
        min: 0
    },
    enrolledStudents: {
        type: Number,
        default: 0,
        min: 0
    },
    instructor: {
        id: {
            type: Number, 
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
    },
    isPublished: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true,
}
);

const courseModel = model('Course', courseSchema)

export default courseModel