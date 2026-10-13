import { Account } from "./../entity/Account";
import { Transaction } from "./../entity/Transaction";
import { User } from "./../entity/User";
import { MyContext } from "./../MyContext";
import { isAuth } from "../middleware";
import { computeSpendingInsights, DEFAULT_DAYS, getInsightsWindow } from "../utils/spendingInsights";
import {
	Resolver,
	Query,
	UseMiddleware,
	Ctx,
	Args,
	ArgsType,
	Field,
	Float,
	Int,
	ObjectType,
} from "type-graphql";
import { MoreThanOrEqual } from "typeorm";

@ObjectType()
export class SpendingCategory {
	@Field()
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
	@Field()
	date: string;

	@Field(() => Float)
	moneyIn: number;

	@Field(() => Float)
	moneyOut: number;
}

@ObjectType()
export class SpendingInsights {
	@Field()
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

/**
 * Declared as an ArgsType so the SDL keeps the contract's argument order
 */
@ArgsType()
export class SpendingInsightsArgs {
	@Field()
	currency: string;

	@Field(() => Int, { defaultValue: DEFAULT_DAYS })
	days: number = DEFAULT_DAYS;
}

@Resolver()
export class InsightsResolver {
	/**
	 * Query for returning spending insights for an authenticated users currency account
	 * over the last `days` UTC days (today inclusive)
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
		const { previousStart } = getInsightsWindow(days, now);
		const transactions: Transaction[] = await Transaction.find({
			where: { account: account, date: MoreThanOrEqual(previousStart) },
		});

		return computeSpendingInsights(transactions, currency, days, now);
	}
}
