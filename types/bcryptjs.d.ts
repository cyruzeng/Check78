declare module "bcryptjs" {
  interface Bcrypt {
    genSalt(rounds?: number): Promise<string>;
    hash(data: string, salt: string): Promise<string>;
    compare(data: string, encrypted: string): Promise<boolean>;
    genSaltSync(rounds?: number): string;
    hashSync(data: string, salt: string): string;
    compareSync(data: string, encrypted: string): boolean;
  }

  const bcrypt: Bcrypt;
  export default bcrypt;
}
