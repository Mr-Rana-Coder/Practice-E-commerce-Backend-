import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        }
    },
    {
        timestamps: true
    }
)

categorySchema.plugin(mongooseAggregatePaginate)

const Category = mongoose.model("Category", categorySchema);

export { Category }