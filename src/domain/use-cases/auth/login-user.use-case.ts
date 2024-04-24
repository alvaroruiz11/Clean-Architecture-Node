import { LoginUserDto } from "../../dtos/auth/login-user.dto";
import { AuthRepository } from "../../repositories/auth.repository";
import { CustomError } from "../../errors/custom.error";
import { JwtAdapter } from "../../../config/jwt";

interface UserToken {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

type SingToken = (payload: Object, duration?: string) => Promise<string | null>;

interface LoginUserUseCase {
  execute(loginUserDto: LoginUserDto): Promise<UserToken>;
}

export class LoginUser implements LoginUserUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly singToken: SingToken = JwtAdapter.generateToken
  ) {}

  async execute(loginUserDto: LoginUserDto): Promise<UserToken> {
    const user = await this.authRepository.login(loginUserDto);

    const token = await this.singToken({ id: user.id });
    if (!token) throw CustomError.internalServer("Error generating token");

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
