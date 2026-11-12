export enum SuccessMessages {
	ADD_MONEY = "Successfully topped up your account.",
	EXCHANGE = "The exchange was successfully executed.",
	TRANSFER = "Your transfer was sent successfully.",
}

export enum ErrorMessages {
	ADD_MONEY = "Failed to top up your account",
	EXCHANGE = "You do not have the sufficient funds to make this exchange.",
	LOGIN = "Invalid login.",
	PASSWORD = "Invalid password.",
	UPDATE_PASSWORD = "Could not change your password, are you sure you entered the correct password?",
	DELETE_ACCOUNT = "Failed to destroy account.",
	BALANCE_LESS_THAN = "Your account balance has fallen below 0. Please top up before deleting.",
	TRANSFER = "We could not complete your transfer.",
	TRANSFER_RECIPIENT = "No account was found for that IBAN.",
	TRANSFER_DAILY_LIMIT = "This transfer would exceed your daily transfer limit.",
	BALANCE_GREATER_THAN = "Your account balance is greater than 0. Please exchange your funds before deleting.",
}
