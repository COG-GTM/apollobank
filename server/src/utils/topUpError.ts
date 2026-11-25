import { ApolloError } from "apollo-server-express";
import { ErrorMessages } from "./messages";

export enum TopUpErrorCodes {
	INVALID_AMOUNT = "TOP_UP_INVALID_AMOUNT",
	ACCOUNT_NOT_FOUND = "TOP_UP_ACCOUNT_NOT_FOUND",
	FAILED = "TOP_UP_FAILED",
}

/**
 * Builds an addMoney error. With TOP_UP_ERROR_CODES=true the error also carries a
 * machine-readable `extensions.code`; the message is the same either way.
 */
export const topUpError = (message: ErrorMessages, code: TopUpErrorCodes): Error =>
	process.env.TOP_UP_ERROR_CODES === "true" ? new ApolloError(message, code) : new Error(message);
