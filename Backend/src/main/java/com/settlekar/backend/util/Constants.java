package com.settlekar.backend.util;

public class Constants {

    // Token Expiration (used in AuthService)
    public static final int VERIFICATION_TOKEN_EXPIRATION_HOURS = 24;
    public static final int PASSWORD_RESET_TOKEN_EXPIRATION_HOURS = 1;

    // Email Templates (used in EmailService)
    public static final String VERIFICATION_EMAIL_SUBJECT = "Verify Your Email - SettleKar";
    public static final String PASSWORD_RESET_EMAIL_SUBJECT = "Reset Your Password - SettleKar";

    // Validation Messages (used in Services)
    public static final String INVALID_TOKEN = "Invalid or expired token";
    public static final String TOKEN_EXPIRED = "Token has expired";
    public static final String TOKEN_ALREADY_USED = "Token has already been used";
    public static final String USER_NOT_FOUND = "User not found";
    public static final String EMAIL_ALREADY_EXISTS = "Email already exists";
    public static final String INVALID_CREDENTIALS = "Invalid email or password";
    public static final String ACCOUNT_NOT_VERIFIED = "Account is not verified. Please check your email.";
    public static final String PASSWORD_MISMATCH = "Current password is incorrect";
    public static final String PASSWORD_CANNOT_BE_SAME_AS_OLD = "New password cannot be the same as the old password";


    // Success Messages (used in Services)
    public static final String SIGNUP_SUCCESS = "Registration successful! Please check your email to verify your account.";
    public static final String LOGIN_SUCCESS = "Login successful";
    public static final String VERIFICATION_SUCCESS = "Email verified successfully! You can now login.";
    public static final String PASSWORD_RESET_EMAIL_SENT = "Password reset instructions have been sent to your email.";
    public static final String PASSWORD_RESET_SUCCESS = "Password has been reset successfully.";
    public static final String PASSWORD_CHANGE_SUCCESS = "Password changed successfully.";
    public static final String PROFILE_UPDATE_SUCCESS = "Profile updated successfully.";

    // Username Messages
    public static final String USERNAME_ALREADY_EXISTS = "Username is already taken";

    // Group Messages
    public static final String GROUP_NOT_FOUND = "Group not found";
    public static final String GROUP_LOCKED = "Group is locked. No modifications allowed.";
    public static final String NOT_GROUP_ADMIN = "Only group admin can perform this action";
    public static final String NOT_GROUP_MEMBER = "You are not a member of this group";
    public static final String ALREADY_GROUP_MEMBER = "User is already a member of this group";
    public static final String BUDGET_CAP_EXCEEDED = "Adding this expense would exceed the group's budget cap";

    // Expense Messages
    public static final String EXPENSE_NOT_FOUND = "Expense not found";
    public static final String INVALID_SHARE_SUM = "Share amounts must sum to the total expense amount";
    public static final String INVALID_PERCENTAGE_SUM = "Share percentages must sum to 100";

    // Settlement Messages
    public static final String SETTLEMENT_NOT_FOUND = "Settlement not found";
    public static final String ONLY_RECEIVER_CAN_CONFIRM = "Only the receiver can confirm a settlement";

    // Payment Messages
    public static final String PAYMENT_NOT_FOUND = "Payment not found";
    public static final String PAYMENT_VERIFICATION_FAILED = "Payment verification failed";

    private Constants() {
        // Private constructor to prevent instantiation
    }
}