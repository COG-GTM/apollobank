import { ObjectType, Field, Int } from "type-graphql";
import { Entity, BaseEntity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from "typeorm";
import { Account } from "./Account";

/**
 * Transfers table: money sent from one Apollo Bank account to another
 */
@ObjectType()
@Entity("transfers")
export class Transfer extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id: number;

	@Field(() => Account)
	@ManyToOne(() => Account, { onDelete: "CASCADE" })
	fromAccount: Account;

	@Field(() => Account)
	@ManyToOne(() => Account, { onDelete: "CASCADE" })
	toAccount: Account;

	@Field()
	@Column()
	amount: number;

	@Field()
	@Column({ default: 0 })
	fee: number;

	@Field({ nullable: true })
	@Column({ nullable: true })
	reference: string;

	@Field()
	@CreateDateColumn()
	createdAt: Date;
}
