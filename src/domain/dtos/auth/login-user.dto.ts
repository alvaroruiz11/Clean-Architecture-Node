import { Validators } from "../../../config";

export class LoginUserDto {
  private constructor(public email: string, public password: string) {}

  static create(object: { [key: string]: any }): [string?, LoginUserDto?] {
    const { email, password } = object;

    if (!email) return ["Messing email", undefined];
    if (!Validators.email.test(email))
      return ["Email is not invalid", undefined];
    if (!password) return ["Messing password", undefined];
    if (password.length < 6) return ["Password is not invalid", undefined];

    return [undefined, new LoginUserDto(email, password)];
  }
}
