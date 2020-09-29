import { UsernamePasswordInput } from "../resolvers/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "invalid email",
      },
    ];
  }

  if (options.username.length < 3) {
    return [
      {
        field: "username",
        message: "username must have at least 3 characters",
      },
    ];
  }

  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "username must not include @",
      },
    ];
  }

  if (options.password.length < 6) {
    return [
      {
        field: "password",
        message: "password must have at least 6 characters",
      },
    ];
  }

  return null;
};
