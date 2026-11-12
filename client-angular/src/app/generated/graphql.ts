import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: { input: any; output: any; }
};

export type Account = {
  __typename?: 'Account';
  balance: Scalars['Float']['output'];
  bic: Scalars['String']['output'];
  currency: Scalars['String']['output'];
  iban: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  sortCode: Scalars['String']['output'];
};

export type AccountResponse = {
  __typename?: 'AccountResponse';
  account: Account;
  message: Scalars['String']['output'];
};

export type Card = {
  __typename?: 'Card';
  cardNumber: Scalars['String']['output'];
  cvv: Scalars['Float']['output'];
  expiresIn: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  monthlySpendingLimit: Scalars['Float']['output'];
  pin: Scalars['Float']['output'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  accessToken: Scalars['String']['output'];
  user: User;
};

export type Mutation = {
  __typename?: 'Mutation';
  addMoney: AccountResponse;
  createAccount: Scalars['Boolean']['output'];
  createCard: Scalars['Boolean']['output'];
  createTransaction: Scalars['Float']['output'];
  deleteAccount: Scalars['Boolean']['output'];
  destroyAccount: Scalars['Boolean']['output'];
  exchange: AccountResponse;
  login: LoginResponse;
  logout: Scalars['Boolean']['output'];
  register: Scalars['Boolean']['output'];
  revokeRefreshTokensForUser: Scalars['Boolean']['output'];
  updatePassword: Scalars['Boolean']['output'];
};


export type MutationAddMoneyArgs = {
  amount: Scalars['Float']['input'];
  currency: Scalars['String']['input'];
};


export type MutationCreateAccountArgs = {
  currency: Scalars['String']['input'];
};


export type MutationCreateTransactionArgs = {
  currency: Scalars['String']['input'];
};


export type MutationDeleteAccountArgs = {
  currency: Scalars['String']['input'];
};


export type MutationExchangeArgs = {
  amount: Scalars['Float']['input'];
  selectedAccountCurrency: Scalars['String']['input'];
  toAccountCurrency: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
  dateOfBirth: Scalars['String']['input'];
  email: Scalars['String']['input'];
  firsName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  postCode: Scalars['String']['input'];
  streetAddress: Scalars['String']['input'];
};


export type MutationRevokeRefreshTokensForUserArgs = {
  userId: Scalars['Int']['input'];
};


export type MutationUpdatePasswordArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  account: Account;
  accounts: Array<Account>;
  cards: Array<Card>;
  me?: Maybe<User>;
  transactions: Array<Transaction>;
};


export type QueryAccountArgs = {
  currency: Scalars['String']['input'];
};


export type QueryTransactionsArgs = {
  currency: Scalars['String']['input'];
};

export type Transaction = {
  __typename?: 'Transaction';
  amount: Scalars['String']['output'];
  date: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  transactionType: Scalars['String']['output'];
};

export type User = {
  __typename?: 'User';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  dateOfBirth: Scalars['String']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  lastName: Scalars['String']['output'];
  postCode: Scalars['String']['output'];
  streetAddress: Scalars['String']['output'];
};

export type AccountQueryVariables = Exact<{
  currency: Scalars['String']['input'];
}>;


export type AccountQuery = { __typename?: 'Query', account: { __typename?: 'Account', id: number, balance: number } };

export type AccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountsQuery = { __typename?: 'Query', accounts: Array<{ __typename?: 'Account', id: number, balance: number, currency: string, sortCode: string, iban: string, bic: string }> };

export type AddMoneyMutationVariables = Exact<{
  amount: Scalars['Float']['input'];
  currency: Scalars['String']['input'];
}>;


export type AddMoneyMutation = { __typename?: 'Mutation', addMoney: { __typename?: 'AccountResponse', message: string, account: { __typename?: 'Account', id: number, balance: number } } };

export type CardsQueryVariables = Exact<{ [key: string]: never; }>;


export type CardsQuery = { __typename?: 'Query', cards: Array<{ __typename?: 'Card', id: number, cardNumber: string, pin: number, expiresIn: any, cvv: number, monthlySpendingLimit: number }> };

export type CreateAccountMutationVariables = Exact<{
  currency: Scalars['String']['input'];
}>;


export type CreateAccountMutation = { __typename?: 'Mutation', createAccount: boolean };

export type CreateCardMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateCardMutation = { __typename?: 'Mutation', createCard: boolean };

export type CreateTransactionMutationVariables = Exact<{
  currency: Scalars['String']['input'];
}>;


export type CreateTransactionMutation = { __typename?: 'Mutation', createTransaction: number };

export type DeleteAccountMutationVariables = Exact<{
  currency: Scalars['String']['input'];
}>;


export type DeleteAccountMutation = { __typename?: 'Mutation', deleteAccount: boolean };

export type DestroyAccountMutationVariables = Exact<{ [key: string]: never; }>;


export type DestroyAccountMutation = { __typename?: 'Mutation', destroyAccount: boolean };

export type ExchangeMutationVariables = Exact<{
  selectedAccountCurrency: Scalars['String']['input'];
  toAccountCurrency: Scalars['String']['input'];
  amount: Scalars['Float']['input'];
}>;


export type ExchangeMutation = { __typename?: 'Mutation', exchange: { __typename?: 'AccountResponse', message: string, account: { __typename?: 'Account', id: number, balance: number } } };

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'LoginResponse', accessToken: string, user: { __typename?: 'User', id: number, email: string, firstName: string, lastName: string, dateOfBirth: string, streetAddress: string, postCode: string, city: string, country: string } } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: number, email: string, firstName: string, lastName: string, dateOfBirth: string, streetAddress: string, postCode: string, city: string, country: string } | null };

export type RegisterMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  dateOfBirth: Scalars['String']['input'];
  streetAddress: Scalars['String']['input'];
  postCode: Scalars['String']['input'];
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: boolean };

export type TransactionsQueryVariables = Exact<{
  currency: Scalars['String']['input'];
}>;


export type TransactionsQuery = { __typename?: 'Query', transactions: Array<{ __typename?: 'Transaction', id: number, transactionType: string, date: any, amount: string }> };

export type UpdatePasswordMutationVariables = Exact<{
  oldPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}>;


export type UpdatePasswordMutation = { __typename?: 'Mutation', updatePassword: boolean };

export const AccountDocument = gql`
    query Account($currency: String!) {
  account(currency: $currency) {
    id
    balance
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class AccountGQL extends Apollo.Query<AccountQuery, AccountQueryVariables> {
    override document = AccountDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const AccountsDocument = gql`
    query Accounts {
  accounts {
    id
    balance
    currency
    sortCode
    iban
    bic
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class AccountsGQL extends Apollo.Query<AccountsQuery, AccountsQueryVariables> {
    override document = AccountsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const AddMoneyDocument = gql`
    mutation AddMoney($amount: Float!, $currency: String!) {
  addMoney(amount: $amount, currency: $currency) {
    account {
      id
      balance
    }
    message
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class AddMoneyGQL extends Apollo.Mutation<AddMoneyMutation, AddMoneyMutationVariables> {
    override document = AddMoneyDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CardsDocument = gql`
    query Cards {
  cards {
    id
    cardNumber
    pin
    expiresIn
    cvv
    monthlySpendingLimit
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class CardsGQL extends Apollo.Query<CardsQuery, CardsQueryVariables> {
    override document = CardsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CreateAccountDocument = gql`
    mutation CreateAccount($currency: String!) {
  createAccount(currency: $currency)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class CreateAccountGQL extends Apollo.Mutation<CreateAccountMutation, CreateAccountMutationVariables> {
    override document = CreateAccountDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CreateCardDocument = gql`
    mutation createCard {
  createCard
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class CreateCardGQL extends Apollo.Mutation<CreateCardMutation, CreateCardMutationVariables> {
    override document = CreateCardDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CreateTransactionDocument = gql`
    mutation CreateTransaction($currency: String!) {
  createTransaction(currency: $currency)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class CreateTransactionGQL extends Apollo.Mutation<CreateTransactionMutation, CreateTransactionMutationVariables> {
    override document = CreateTransactionDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DeleteAccountDocument = gql`
    mutation DeleteAccount($currency: String!) {
  deleteAccount(currency: $currency)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DeleteAccountGQL extends Apollo.Mutation<DeleteAccountMutation, DeleteAccountMutationVariables> {
    override document = DeleteAccountDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DestroyAccountDocument = gql`
    mutation DestroyAccount {
  destroyAccount
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DestroyAccountGQL extends Apollo.Mutation<DestroyAccountMutation, DestroyAccountMutationVariables> {
    override document = DestroyAccountDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const ExchangeDocument = gql`
    mutation Exchange($selectedAccountCurrency: String!, $toAccountCurrency: String!, $amount: Float!) {
  exchange(
    selectedAccountCurrency: $selectedAccountCurrency
    toAccountCurrency: $toAccountCurrency
    amount: $amount
  ) {
    account {
      id
      balance
    }
    message
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class ExchangeGQL extends Apollo.Mutation<ExchangeMutation, ExchangeMutationVariables> {
    override document = ExchangeDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const LoginDocument = gql`
    mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    accessToken
    user {
      id
      email
      firstName
      lastName
      dateOfBirth
      streetAddress
      postCode
      city
      country
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class LoginGQL extends Apollo.Mutation<LoginMutation, LoginMutationVariables> {
    override document = LoginDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class LogoutGQL extends Apollo.Mutation<LogoutMutation, LogoutMutationVariables> {
    override document = LogoutDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const MeDocument = gql`
    query Me {
  me {
    id
    email
    firstName
    lastName
    dateOfBirth
    streetAddress
    postCode
    city
    country
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class MeGQL extends Apollo.Query<MeQuery, MeQueryVariables> {
    override document = MeDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const RegisterDocument = gql`
    mutation Register($email: String!, $password: String!, $firstName: String!, $lastName: String!, $dateOfBirth: String!, $streetAddress: String!, $postCode: String!, $city: String!, $country: String!) {
  register(
    email: $email
    password: $password
    firsName: $firstName
    lastName: $lastName
    dateOfBirth: $dateOfBirth
    streetAddress: $streetAddress
    postCode: $postCode
    city: $city
    country: $country
  )
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class RegisterGQL extends Apollo.Mutation<RegisterMutation, RegisterMutationVariables> {
    override document = RegisterDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const TransactionsDocument = gql`
    query Transactions($currency: String!) {
  transactions(currency: $currency) {
    id
    transactionType
    date
    amount
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class TransactionsGQL extends Apollo.Query<TransactionsQuery, TransactionsQueryVariables> {
    override document = TransactionsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdatePasswordDocument = gql`
    mutation UpdatePassword($oldPassword: String!, $newPassword: String!) {
  updatePassword(oldPassword: $oldPassword, newPassword: $newPassword)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class UpdatePasswordGQL extends Apollo.Mutation<UpdatePasswordMutation, UpdatePasswordMutationVariables> {
    override document = UpdatePasswordDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }