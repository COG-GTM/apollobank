import { Account } from "./../entity/Account";
import { Transaction } from "./../entity/Transaction";
import { User } from "./../entity/User";
import { MyContext } from "./../MyContext";
import { isAuth } from "../middleware";
import {
	Resolver,
	Query,
	UseMiddleware,
	Ctx,
	Args,
	ArgsType,
	Int,
	Float,
	ObjectType,
	Field,
} from "type-graphql";
import { MoreThanOrEqual } from "typeorm";
import { aggregateSpendingInsights, getInsightsWindow } from "../utils/spendingInsights";

@ObjectType()
export class SpendingCategory {
	@Field(() => String)
	transactionType: string;

	@Field(() => Float)
	total: number;

	@Field(() => Int)
	count: number;

	@Field(() => Float)
	share: number;
}

@ObjectType()
export class DailySpend {
	@Field(() => String)
	date: string;

	@Field(() => Float)
	moneyIn: number;

	@Field(() => Float)
	moneyOut: number;
}

@ObjectType()
export class SpendingInsights {
	@Field(() => String)
	currency: string;

	@Field(() => Float)
	totalIn: number;

	@Field(() => Float)
	totalOut: number;

	@Field(() => Float)
	net: number;

	@Field(() => Transaction, { nullable: true })
	largestTransaction: Transaction | null;

	@Field(() => Float, { nullable: true })
	changeVsPreviousPeriodPct: number | null;

	@Field(() => [SpendingCategory])
	categories: SpendingCategory[];

	@Field(() => [DailySpend])
	daily: DailySpend[];
}

@ArgsType()
export class SpendingInsightsArgs {
	@Field(() => String)
	currency: string;

	@Field(() => Int, { defaultValue: 30 })
	days: number;
}

@Resolver()
export class InsightsResolver {
	/**
	 * Query for returning spending insights for an authenticated users currency account
	 * over the last `days` days (clamped to 1–365)
	 * @param param0 currency and days
	 * @param param1
	 */
	@Query(() => SpendingInsights, { nullable: true })
	@UseMiddleware(isAuth)
	async spendingInsights(
		@Args() { currency, days }: SpendingInsightsArgs,
		@Ctx() { payload }: MyContext
	): Promise<SpendingInsights | null> {
		if (!payload) {
			return null;
		}

		const owner: User | undefined = await User.findOne({ where: { id: payload.userId } });

		if (!owner) {
			return null;
		}

		const account: Account | undefined = await Account.findOne({
			where: { owner: owner, currency: currency },
		});

		if (!account) {
			return null;
		}

		const now = new Date();
		const window = getInsightsWindow(days, now);
		const transactions: Transaction[] = await Transaction.find({
			where: { account: account, date: MoreThanOrEqual(window.previousStart) },
		});

		return aggregateSpendingInsights(transactions, currency, window.days, now);
	}
}
