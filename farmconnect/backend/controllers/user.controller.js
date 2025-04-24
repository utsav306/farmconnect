const { User, ROLES } = require("../models/user.model");

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get users", error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get user", error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, roles, isActive } = req.body;

    // Only allow users to update their own profile, unless they're admins
    if (
      userId !== req.user.id.toString() &&
      !req.user.roles.includes(ROLES.ADMIN)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this user" });
    }

    // Prepare update object
    const updateData = {};

    if (username) updateData.username = username;
    if (email) updateData.email = email;

    // Only admins can update roles and active status
    if (req.user.roles.includes(ROLES.ADMIN)) {
      if (roles) updateData.roles = roles;
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admins from deleting themselves
    if (userId === req.user.id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};

// Change user roles (admin only)
exports.changeUserRoles = async (req, res) => {
  try {
    const { roles } = req.body;
    const userId = req.params.id;

    // Prevent admins from changing their own roles
    if (userId === req.user.id.toString()) {
      return res.status(400).json({ message: "Cannot change your own roles" });
    }

    // Update roles
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { roles } },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User roles updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update user roles", error: error.message });
  }
};
