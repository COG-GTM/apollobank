import { ErrorMessages } from "./../utils/messages";
import { createRandomBicCode } from "./../utils/createRandom";
import { isAuth } from "../middleware";
import {
	Query,
	Resolver,
	Mutation,
	Ctx,
	UseMiddleware,
	Arg,
	ObjectType,
	Field,
} from "type-graphql";
import { MyContext } from "../MyContext";
import { User } from "../entity/User";
import { Account } from "../entity/Account";
import { createRandomSortCode, createRandomIbanCode } from "../utils/createRandom";
import { SuccessMessages } from "../utils/messages";
import { addMoneySchema } from "../utils/validation";
import { topUpError, TopUpErrorCodes } from "../utils/topUpError";
import { convertAmount } from "../utils/exchangeRates";

@ObjectType()
class AccountResponse {
	@Field(() => Account)
	account: Account;

	@Field(() => String)
	message: String;
}

@Resolver()
export class AccountResolver {
	/**
	 * Used to query and find all the accounts for an authenticated user
	 * @param param0
	 */
	@Query(() => [Account])
	@UseMiddleware(isAuth)
	async accounts(@Ctx() { payload }: MyContext) {
		if (!payload) {
			return null;
		}

		const owner: User | undefined = await User.findOne({ where: { id: payload.userId } });

		if (owner) {
			return Account.find({ where: { owner: owner } });
		}

		return null;
	}

	/**
	 * Used to query and find a single account specified by the currency (EUR account, USD account or GBP account)
	 * @param currency
	 * @param param1
	 */
	@Query(() => Account)
	@UseMiddleware(isAuth)
	async account(
		@Arg("currency") currency: string,
		@Ctx() { payload }: MyContext
	): Promise<Account | undefined> {
		if (!payload) {
			throw new Error("");
		}

		const owner: User | undefined = await User.findOne({ where: { id: payload.userId } });

		if (owner) {
			const account = Account.findOne({ where: { owner: owner, currency: currency } });

			if (account) {
				return account;
			}
		}

		return undefined;
	}

	/**
	 * Mutation which allows a user to add money into their account
	 * @param amount
	 * @param currency
	 * @param param2
	 */
	@Mutation(() => AccountResponse)
	@UseMiddleware(isAuth)
	async addMoney(
		@Arg("amount") amount: number,
		@Arg("currency") currency: string,
		@Ctx() { payload }: MyContext
	): Promise<AccountResponse | null> {
		if (!payload) {
			return null;
		}

		const { error } = addMoneySchema.validate({ amount });
		if (error) {
			throw topUpError(ErrorMessages.ADD_MONEY_INVALID_AMOUNT, TopUpErrorCodes.INVALID_AMOUNT);
		}

		let owner: User | undefined;
		let account: Account | undefined;
		try {
			owner = await User.findOne({ where: { id: payload.userId } });
			account = owner ? await Account.findOne({ where: { owner: owner, currency: currency } }) : undefined;
		} catch (err) {
			throw topUpError(ErrorMessages.ADD_MONEY, TopUpErrorCodes.FAILED);
		}

		if (!account) {
			throw topUpError(ErrorMessages.ADD_MONEY_NO_ACCOUNT, TopUpErrorCodes.ACCOUNT_NOT_FOUND);
		}

		let updatedAccount: Account | undefined;
		try {
			await Account.update({ id: account.id }, { balance: account.balance + amount });
			updatedAccount = await Account.findOne({ where: { owner: owner, currency: currency } });
		} catch (err) {
			throw topUpError(ErrorMessages.ADD_MONEY, TopUpErrorCodes.FAILED);
		}

		if (!updatedAccount) {
			throw topUpError(ErrorMessages.ADD_MONEY, TopUpErrorCodes.FAILED);
		}

		return {
			account: updatedAccount,
			message: SuccessMessages.ADD_MONEY,
		};
	}

	/**
	 * Mutation which allows a user to exchange money from one account to another
	 * @param selectedAccountCurrency
	 * @param toAccountCurrency
	 * @param amount
	 * @param param3
	 */
	@Mutation(() => AccountResponse)
	@UseMiddleware(isAuth)
	async exchange(
		@Arg("selectedAccountCurrency") selectedAccountCurrency: string,
		@Arg("toAccountCurrency") toAccountCurrency: string,
		@Arg("amount") amount: number,
		@Ctx() { payload }: MyContext
	): Promise<AccountResponse | null> {
		if (!payload) {
			return null;
		}

		const amountWithConversion: number | undefined = convertAmount(
			amount,
			selectedAccountCurrency,
			toAccountCurrency
		);

		// Balances are whole units: reject non-positive or fractional amounts and unsupported or same-currency pairs before touching any balance
		if (!Number.isInteger(amount) || amount <= 0 || amountWithConversion === undefined) {
			throw new Error(ErrorMessages.EXCHANGE_INVALID);
		}

		const owner: User | undefined = await User.findOne({ where: { id: payload.userId } });

		if (owner) {
			const currentAccount: Account | undefined = await Account.findOne({
				where: { owner: owner, currency: selectedAccountCurrency },
			});

			if (currentAccount) {
				if (currentAccount.balance >= amount) {
					// Exchange the amount to the other account
					const toAccount: Account | undefined = await Account.findOne({
						where: {
							owner: owner,
							currency: toAccountCurrency,
						},
					});

					if (toAccount) {
						try {
							// Credit the converted amount and debit exactly the amount entered
							await Account.update(
								{ id: toAccount.id },
								{ balance: toAccount.balance + amountWithConversion }
							);
							await Account.update(
								{ id: currentAccount.id },
								{ balance: currentAccount.balance - amount }
							);
						} catch (error) {
							console.log(error);
							throw new Error(ErrorMessages.EXCHANGE);
						}
					}
				} else {
					throw new Error(ErrorMessages.EXCHANGE);
				}
			}
		}

		try {
			const updatedAccount = await Account.findOne({
				where: { owner: owner, currency: selectedAccountCurrency },
			});

			if (updatedAccount) {
				return {
					account: updatedAccount,
					message: SuccessMessages.EXCHANGE,
				};
			}
		} catch (error) {
			throw new Error(ErrorMessages.EXCHANGE);
		}

		return null;
	}

	/**
	 * Mutation for creating a new currency account
	 * @param currency
	 * @param param1
	 */
	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async createAccount(@Arg("currency") currency: string, @Ctx() { payload }: MyContext) {
		if (!payload) {
			return false;
		}

		const owner: User | undefined = await User.findOne({ where: { id: payload.userId } });

		if (owner) {
			const account: Account | undefined = await Account.findOne({
				where: { owner: owner, currency: currency },
			});

			if (account) {
				throw new Error(`You already have a ${currency} account`);
			} else {
				try {
					await Account.insert({
						owner,
						currency,
						sortCode: currency === "GBP" ? createRandomSortCode() : "00-00-00",
						iban: createRandomIbanCode(),
						bic: createRandomBicCode(),
					});
				} catch (err) {
					console.log(err);
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * Mutation for deleting a specified currency account
	 * @param currency
	 * @param param1
	 */
	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async deleteAccount(@Arg("currency") currency: string, @Ctx() { payload }: MyContext) {
		if (!payload) {
			return false;
		}

		const owner: User | undefined = await User.findOne({ where: { id: payload.userId } });

		if (owner) {
			const account: Account | undefined = await Account.findOne({
				where: { owner: owner, currency: currency },
			});

			// If the account exists, only allow the removal of an account if the user has no debt or if the users account is empty
			if (account) {
				if (account.balance == 0) {
					try {
						await Account.delete({
							id: account.id,
						});
					} catch (error) {
						console.log(error);
						return false;
					}
				} else if (account.balance < 0) {
					throw new Error(ErrorMessages.BALANCE_LESS_THAN);
				} else if (account.balance > 0) {
					throw new Error(ErrorMessages.BALANCE_GREATER_THAN);
				}
			}
		}
		return true;
	}
}
