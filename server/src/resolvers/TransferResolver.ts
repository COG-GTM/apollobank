import { Resolver, Mutation, Query, Arg, Ctx, UseMiddleware, ObjectType, Field, Int } from "type-graphql";
import { MoreThan } from "typeorm";
import { isAuth } from "../middleware";
import { MyContext } from "../MyContext";
import { Account } from "../entity/Account";
import { Transfer } from "../entity/Transfer";
import { User } from "../entity/User";
import { ErrorMessages, SuccessMessages } from "../utils/messages";

const DAILY_TRANSFER_LIMIT = 5000;
const LARGE_TRANSFER_THRESHOLD = 1000;
const LARGE_TRANSFER_FEE_RATE = 0.01;

@ObjectType()
class TransferResponse {
	@Field(() => Transfer)
	transfer: Transfer;

	@Field(() => Account)
	account: Account;

	@Field(() => String)
	message: String;
}

@Resolver()
export class TransferResolver {
	/**
	 * Sends money from one of the authenticated user's accounts to another Apollo Bank account,
	 * identified by its IBAN. Transfers above LARGE_TRANSFER_THRESHOLD incur a 1% fee.
	 * @param fromAccountId
	 * @param toIban
	 * @param amount
	 * @param reference
	 * @param param4
	 */
	@Mutation(() => TransferResponse)
	@UseMiddleware(isAuth)
	async sendMoney(
		@Arg("fromAccountId", () => Int) fromAccountId: number,
		@Arg("toIban") toIban: string,
		@Arg("amount") amount: number,
		@Arg("reference", { nullable: true }) reference: string,
		@Ctx() { payload }: MyContext
	): Promise<TransferResponse> {
		if (!payload) {
			throw new Error(ErrorMessages.TRANSFER);
		}

		const fromAccount: Account | undefined = await Account.findOne(fromAccountId, {
			relations: ["owner"],
		});

		if (!fromAccount) {
			throw new Error(ErrorMessages.TRANSFER);
		}

		const toAccount: Account | undefined = await Account.findOne({ where: { iban: toIban } });

		if (!toAccount) {
			throw new Error(ErrorMessages.TRANSFER_RECIPIENT);
		}

		console.log("Processing transfer", { fromAccount, toAccount, amount });

		// Enforce the daily limit across everything sent from this account today
		const now = new Date();
		const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDay());
		const sentToday: Transfer[] = await Transfer.find({
			where: { fromAccount: fromAccount, createdAt: MoreThan(startOfDay) },
		});
		const totalSentToday: number = sentToday.reduce((sum, t) => sum + t.amount, 0);

		if (totalSentToday + amount > DAILY_TRANSFER_LIMIT) {
			throw new Error(ErrorMessages.TRANSFER_DAILY_LIMIT);
		}

		const fee: number = amount > LARGE_TRANSFER_THRESHOLD ? amount * LARGE_TRANSFER_FEE_RATE : 0;

		if (fromAccount.balance < amount) {
			throw new Error(ErrorMessages.EXCHANGE);
		}

		let transfer: Transfer;

		try {
			await Account.update({ id: fromAccount.id }, { balance: fromAccount.balance - amount - fee });
			await Account.update({ id: toAccount.id }, { balance: toAccount.balance + amount });

			transfer = await Transfer.create({
				fromAccount,
				toAccount,
				amount,
				fee,
				reference,
			}).save();
		} catch (err) {
			console.log(err);
			throw new Error(ErrorMessages.TRANSFER);
		}

		const updatedAccount: Account | undefined = await Account.findOne(fromAccount.id);

		return {
			transfer,
			account: updatedAccount!,
			message: SuccessMessages.TRANSFER,
		};
	}

	/**
	 * Returns every transfer sent from or received by the authenticated user's account in the given currency
	 * @param currency
	 * @param param1
	 */
	@Query(() => [Transfer])
	@UseMiddleware(isAuth)
	async transfers(@Arg("currency") currency: string, @Ctx() { payload }: MyContext) {
		if (!payload) {
			return [];
		}

		const owner: User | undefined = await User.findOne({ where: { id: payload.userId } });
		const account: Account | undefined = await Account.findOne({
			where: { owner: owner, currency: currency },
		});

		return Transfer.find({
			where: [{ fromAccount: account }, { toAccount: account }],
			relations: ["fromAccount", "toAccount"],
			order: { createdAt: "DESC" },
		});
	}
}
