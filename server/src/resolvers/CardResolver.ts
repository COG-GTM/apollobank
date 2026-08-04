import { createRandomCardNumber, createRandomNumber } from "./../utils/createRandom";
import { MyContext } from "./../MyContext";
import { isAuth } from "../middleware";
import { Resolver, Mutation, UseMiddleware, Ctx, Query } from "type-graphql";
import { Card } from "../entity/Card";

@Resolver()
export class CardResolver {
	/**
	 * Query for returning all the cards for an authenticated user
	 * @param param0
	 */
	@Query(() => [Card])
	@UseMiddleware(isAuth)
	async cards(@Ctx() { payload }: MyContext) {
		if (!payload) {
			return null;
		}

		const cards = await Card.find({ where: { owner: { id: parseInt(payload.userId) } } });
		return cards;
	}

	/**
	 * Mutation for creating a new card
	 * @param param0
	 */
	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async createCard(@Ctx() { payload }: MyContext) {
		if (!payload) {
			return false;
		}

		try {
			await Card.insert({
				owner: { id: parseInt(payload.userId) },
				cardNumber: createRandomCardNumber(),
				expiresIn: new Date(2023, 9),
				pin: parseInt(createRandomNumber(4)),
				cvv: parseInt(createRandomNumber(3)),
				monthlySpendingLimit: 500,
			});
		} catch (err) {
			console.log(err);
			return false;
		}

		return true;
	}
}
