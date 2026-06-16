import { IUser, UserRole } from './user.interface';

export interface IRegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IAuthResponse {
  token: string;
  user: IUser;
}

export interface IJwtPayload {
  id: string;
  role: UserRole;
}

// Extend global/express namespaces to include user field on Request objects
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}
