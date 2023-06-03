import NextAuth, { DefaultSession } from "next-auth";

enum Status {
  Approved = "Approved",
  Pending = "Pending",
  Denied = "Denied",
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  status: Status;
  age: number;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: User & DefaultSession["user"];
  }
}
