import express, { Request, Response } from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/UserResolver";
import { AccountResolver } from "./resolvers/AccountResolver";
import { TransactionResolver } from "./resolvers/TransactionResolver";
import cookieParser from "cookie-parser";
import cors from "cors";
import { refreshToken } from "./utils/refreshToken";
import { createTypeOrmConnection } from "./utils/createTypeOrmConnection";
import { createConnection } from "typeorm";
import { CardResolver } from "./resolvers/CardResolver";
import "dotenv/config";
import "reflect-metadata";

(async () => {
	const app = express();

	app.use(cookieParser());
	app.use(
		cors({
			origin:
				process.env.NODE_ENV === "production"
					? "https://vigilant-goldwasser-9ac664.netlify.app"
					: "http://localhost:3000",
			credentials: true,
		})
	);

	app.get("/", (_req: Request, res: Response) => {
		res.send("🚀 Server is running");
	});

	app.post("/refresh_token", refreshToken);

	process.env.NODE_ENV === "production"
		? await createTypeOrmConnection()
		: await createConnection();

	const appolloServer: ApolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [UserResolver, AccountResolver, TransactionResolver, CardResolver],
		}),
		introspection: true,
		playground: true,
		context: ({ req, res }) => ({ req, res }),
	});

	appolloServer.applyMiddleware({ app, cors: false });

	app.listen(process.env.PORT || 4000, () => {
		console.log(`🚀 Server ready at ${process.env.PORT || 4000}${appolloServer.graphqlPath}`);
	});
})();
