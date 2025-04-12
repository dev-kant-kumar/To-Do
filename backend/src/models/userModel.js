const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9_]+$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid username. Use only letters, numbers and underscores.`,
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address.`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Don't include password in query results by default
    },
    profilePicture: {
      type: String,
      default: "default-avatar.png",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically create and update createdAt and updatedAt fields
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password; // Ensure password is never sent to client
        return ret;
      },
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Add virtual property for full user information
UserSchema.virtual("userInfo").get(function () {
  return `${this.name} (${this.username})`;
});

// Index for faster queries
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });

// Pre-save middleware (if needed for additional operations)
UserSchema.pre("save", function (next) {
  // Update the updatedAt field
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("User", UserSchema, "users");
