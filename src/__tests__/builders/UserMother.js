import { User } from "../../domain/User.js";

export default class UserMother {
  static umUsuarioPadrao() {
    return new User("u-001", "Usuário Padrão", "user@email.com", "PADRAO");
  }

  static umUsuarioPremium() {
    return new User("u-999", "Usuário Premium", "premium@email.com", "PREMIUM");
  }
}
