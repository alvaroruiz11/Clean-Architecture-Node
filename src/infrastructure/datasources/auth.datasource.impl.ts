import { UserModel } from "../../data/mongodb";
import { BcryptAdapter } from "../../config/bcrypt";
import { UserMapper } from "../mappers/user.mapper";
import {
  AuthDatasource,
  RegisterUserDto,
  UserEntity,
  CustomError,
  LoginUserDto,
} from "../../domain";

type HashFunction = (password: string) => string;
type CompareFunction = (password: string, hashed: string) => boolean;

export class AuthDatasourceImpl implements AuthDatasource {
  constructor(
    private readonly hashPassword: HashFunction = BcryptAdapter.hash,
    private readonly comparePassword: CompareFunction = BcryptAdapter.compare
  ) {}

  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const { email, password } = loginUserDto;

    try {
      const user = await UserModel.findOne({ email });
      if (!user) throw CustomError.badRequest("User does not exists - email");

      const isMatching = this.comparePassword(password, user.password);
      if (!isMatching) throw CustomError.badRequest("Password is not valid");

      return UserMapper.userEntityFromObject(user);
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async register(registerUserDto: RegisterUserDto): Promise<UserEntity> {
    const { name, email, password } = registerUserDto;

    try {
      const exists = await UserModel.findOne({ email });
      if (exists) throw CustomError.badRequest("User already exists");

      // 2. Hash de contraseña
      const user = await UserModel.create({
        name,
        email,
        password: this.hashPassword(password),
      });

      await user.save();

      //TODO: 3. Mapper la respuesta a nuestra identidad
      return UserMapper.userEntityFromObject(user);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }
}
